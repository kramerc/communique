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

  ipc.on('buffer:input', function (event, msg) {
    if (utils.isCommand(msg.message)) {
      commands.handle(this, msg.buffer.parent, msg.message);
    } else {
      this.connections[msg.buffer.parent].irc.send(
        msg.buffer.name, msg.message);
    }
  }.bind(this));

  ipc.on('settings', function (event, settings) {
    this.settings = settings;
  }.bind(this));
}

Client.prototype.connect = function (server, options) {
  if (!options.nick) {
    options.nick = this.settings.nick || 'Communique';
  }

  if (!options.username) {
    options.username = this.settings.username || 'communique';
  }

  if (!options.realname) {
    options.realname = this.settings.realname || 'Communique User';
  }

  // Create a buffer for the server
  this.bufferManager.create({
    parent: server,
    name: 'server'
  }).switchTo();

  this.connections[server] = new Connection(this, server, options);
};

module.exports = Client;
