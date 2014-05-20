'use strict';

var events = require('events');
var util = require('util');

var utils = require('../../utils');

function Buffer(args) {
  this.parent = args.parent || 'default';
  this.name = args.name;
  this.displayName = args.displayName || args.name;
  this.component = utils.dasherize(args.component || 'Messages');
  this.closable = args.closable === false ? false : true;
}

util.inherits(Buffer, events.EventEmitter);

Buffer.prototype.names = function (names) {
  this.emit('names', names);

  return this;
};

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
