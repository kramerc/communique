'use strict';

var ipc = require('ipc');

var Connection = require('./connection');

function Client(browserWindow) {
  var self = this;

  this.browserWindow = browserWindow;
  this.buffers = {};
  this.connections = {};

  ipc.on('message:send', function (event, msg) {
    self.connections[msg.buffer.parent].irc.send(
      msg.buffer.name, msg.message);
  });
}

Client.prototype.connect = function (network, options) {
  this.connections[network] = new Connection(this, network, options);
};

Client.prototype.createBuffer = function () {
  var parent, name;

  if (arguments.length < 2) {
    parent = 'default';
    name = arguments[0];
  } else {
    parent = arguments[0];
    name = arguments[1];
  }

  if (!this.buffers[parent]) {
    this.buffers[parent] = [];
  }

  if (this.buffers[parent].indexOf(name) !== -1) {
    // Buffer already exists
    return false;
  }

  this.buffers[parent].push(name);

  this.browserWindow.webContents.send('buffer:create', {
    parent: parent,
    name: name
  });

  return true;
};

Client.prototype.deleteBuffer = function () {
  var parent, name;

  if (arguments.length < 2) {
    parent = 'default';
    name = arguments[0];
  } else {
    parent = arguments[0];
    name = arguments[1];
  }

  if (!this.buffers[parent]) {
    throw new Error('Parent ' + parent + ' does not exist');
  }

  var bufferIndex = this.buffers[parent].indexOf(name);
  if (bufferIndex === -1) {
    throw new Error('Buffer ' + name + ' does not exist');
  }
  this.buffers[parent].splice(bufferIndex, 1);

  // Remove the parent if it no longer contains buffers
  if (this.buffers[parent].length === 0) {
    this.buffers[parent] = undefined;
  }

  this.browserWindow.webContents.send('buffer:delete', {
    parent: parent,
    name: name
  });
};

module.exports = Client;
