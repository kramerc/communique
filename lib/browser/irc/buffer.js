'use strict';

var events = require('events');
var util = require('util');

function Buffer(args) {
  this.parent = args.parent || 'default';
  this.name = args.name;
  this.displayName = args.displayName || args.name;
  this.active = false;
}

util.inherits(Buffer, events.EventEmitter);

Buffer.prototype.switchTo = function () {
  this.emit('switch');

  return this;
};

Buffer.prototype.write = function (args) {
  if (typeof args === 'string') {
    args = {message: args};
  }

  this.emit('message', {
    timestamp: Date.now(),
    from: args.from,
    message: args.message,
    to: args.to
  });

  return this;
};

module.exports = Buffer;