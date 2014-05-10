'use strict';

var ipc = require('ipc');

var Connection = require('./connection');
var commands = require('./commands');
var utils = require('../../utils');

function Client(browserWindow) {
  var self = this;

  this.browserWindow = browserWindow;
  this.buffers = {};
  this.connections = {};

  ipc.on('message:send', function (event, msg) {
    if (utils.isCommand(msg.message)) {
      commands.handle(self.connections[msg.buffer.parent], msg.message);
    } else {
      self.connections[msg.buffer.parent].irc.send(
        msg.buffer.name, msg.message);
    }
  });
}

Client.prototype.connect = function (network, options) {
  this.connections[network] = new Connection(this, network, options);
};

Client.prototype.bufferExists = function (args) {
  if (!this.buffers[args.parent]) {
    return false;
  }

  if (this.buffers[args.parent].indexOf(args.name) !== -1) {
    return false;
  }

  return true;
};

Client.prototype.createBuffer = function (args) {
  if (!args.parent) {
    args.parent = 'default';
  }

  if (!this.buffers[args.parent]) {
    this.buffers[args.parent] = [];
  }

  if (this.bufferExists(args.parent, args.name)) {
    // Buffer already exists
    return false;
  }

  this.buffers[args.parent].push(args.name);

  this.browserWindow.webContents.send('buffer:create', args);

  return true;
};

Client.prototype.deleteBuffer = function (args) {
  if (!args.parent) {
    args.parent = 'default';
  }

  if (!this.buffers[args.parent]) {
    throw new Error('Parent ' + args.parent + ' does not exist');
  }

  var bufferIndex = this.buffers[args.parent].indexOf(name);
  if (bufferIndex === -1) {
    throw new Error('Buffer ' + args.name + ' does not exist');
  }
  this.buffers[args.parent].splice(bufferIndex, 1);

  // Remove the parent if it no longer contains buffers
  if (this.buffers[args.parent].length === 0) {
    this.buffers[args.parent] = undefined;
  }

  this.browserWindow.webContents.send('buffer:delete', args);
};

module.exports = Client;
