'use strict';

var Buffer = require('./buffer');

function BufferManager(client) {
  this.client = client;
  this.buffers = {};
}

BufferManager.prototype.delete = function (buffer) {
  delete this.buffers[buffer.parent][buffer.name];
  this.client.browserWindow.webContents.send('buffer:delete', buffer);
};

BufferManager.prototype.deleteParent = function (parent) {
  for (var child in this.buffers[parent]) {
    if (this.buffers[parent].hasOwnProperty(child)) {
      this.client.browserWindow.webContents.send(
        'buffer:delete', this.buffers[parent][child]);
      delete this.buffers[parent][child];
    }
  }
  delete this.buffers[parent];
};

BufferManager.prototype.find = function (args) {
  if (!args.parent) {
    args.parent = 'default';
  }

  if (!this.buffers[args.parent]) {
    return null;
  }

  return this.buffers[args.parent][args.name] || null;
};

BufferManager.prototype.create = function (args) {
  var buffer = this.find(args);
  var webContents = this.client.browserWindow.webContents;

  if (!args.parent) {
    args.parent = 'default';
  }

  if (buffer) {
    // Buffer already exists
    throw new Error('Buffer %s-%s already exists', args.parent, args.name);
  }

  if (!this.buffers[args.parent]) {
    this.buffers[args.parent] = {};
  }

  buffer = this.buffers[args.parent][args.name] = new Buffer(args);

  // Attach buffer listeners
  // Ideally, it would be better to have the components handle these but the
  // Buffer instance is converted to an Object when passed to the renderer.
  buffer.on('message', function (message) {
    webContents.send('buffer:message', buffer, message);
  }).on('switch', function () {
    webContents.send('buffer:switch', buffer);
  });

  // Inform the renderer about the new buffer
  webContents.send('buffer:create', buffer);

  return buffer;
};

BufferManager.prototype.findOrCreate = function (args) {
  var buffer = this.find(args);
  if (!buffer) {
    buffer = this.create(args);
  }
  return buffer;
};

module.exports = BufferManager;
