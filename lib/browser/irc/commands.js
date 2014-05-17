'use strict';

exports.handle = function (client, server, message) {
  var args = message.split(' ');
  var command = args.splice(0, 1)[0].substring(1).toLowerCase();

  // Only certain commands need the client
  switch (command) {
  case 'connect':
    args.unshift(client);
    break;
  default:
    args.unshift(client.connections[server]);
  }

  exports[command].apply(exports, args);
};

/**
 * Connects to an IRC server.
 *
 * /connect <host> [<port> [<pass>]]
 */
exports.connect = function (client, host, port, pass) {
  client.connect(host, {
    host: host,
    port: parseInt(port) || 6667,
    pass: pass
  });
};

exports.nick = function (connection, nick) {
  connection.irc.nick(nick);
};

exports.query = function (connection, nick) {
  connection.client.bufferManager.create({
    parent: connection.network,
    name: nick,
  }).switchTo();
};

exports.join = function (connection, channels, keys) {
  connection.join(channels, keys);
};

exports.part = function (connection, channel, message) {
  if (arguments.length > 3) {
    message = Array.prototype.slice.call(arguments, 2).join(' ');
  }
  connection.part(channel, message);
};
