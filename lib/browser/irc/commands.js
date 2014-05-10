'use strict';

exports.handle = function (connection, message) {
  var args = message.split(' ');
  var command = args.splice(0, 1)[0].substring(1).toLowerCase();

  args.unshift(connection);
  exports[command].apply(exports, args);
};

exports.join = function (connection, channel) {
  connection.joinChannel(channel);
};
