'use strict';

function Client(browserWindow) {
  this.browserWindow = browserWindow;
  this.buffers = {};
}

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
  this.buffers[parent].push(name);

  this.browserWindow.webContents.send('buffer:create', {
    parent: parent,
    name: name
  });
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
