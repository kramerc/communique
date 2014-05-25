'use strict';

var ipc = require('ipc');

var BufferManager = require('./buffer-manager');
var Connection = require('./connection');
var commands = require('./commands');
var utils = require('../../utils');

function Client(browserWindow) {
  this.browserWindow = browserWindow;
  this.bufferManager = new BufferManager(this);
  this.connections = {};
  this.settings = {};

  ipc.on('buffer:requestClose', function (event, buffer) {
    if (buffer.name === 'server') {
      // Quit from IRC
      this.connections[buffer.parent].quit();

      // Delete all buffers related to the server
      this.bufferManager.deleteParent(buffer.parent);

      return;
    }

    if (utils.isChannel(buffer.name)) {
      // Part the channel
      this.connections[buffer.parent].part(buffer.name);

      return;
    }

    this.bufferManager.delete(buffer);
  }.bind(this));

  ipc.on('buffer:input', function (event, msg) {
    if (utils.isCommand(msg.message)) {
      commands.handle(this, msg.buffer.parent, msg.message);
    } else {
      this.connections[msg.buffer.parent].privmsg(
        msg.buffer.name, msg.message);
    }
  }.bind(this));

  ipc.on('settings', function (event, settings) {
    this.settings = settings;
  }.bind(this));
}

Client.prototype.connect = function (server, options) {
  if (!options.nick) {
    options.nick = this.settings.nick;
  }

  if (!options.username) {
    options.username = this.settings.username;
  }

  if (!options.realname) {
    options.realname = this.settings.realname;
  }

  // Create a buffer for the server
  this.bufferManager.create({
    parent: server,
    name: 'server'
  }).switchTo();

  this.connections[server] = new Connection(this, server, options);
};

Client.prototype.writeToDefaultBuffer = function (message) {
  this.bufferManager.findOrCreate({name: 'default'}).write(message);
};

module.exports = Client;
