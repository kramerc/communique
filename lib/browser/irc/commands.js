'use strict';

var utils = require('../../utils');

exports.handle = function (client, server, message) {
  var args = message.split(' ');
  var command = args.splice(0, 1)[0].substring(1).toLowerCase();

  if (!exports[command]) {
    client.writeToDefaultBuffer('No such command "' + command + '"');
    return;
  }

  // Only certain commands need the client
  switch (command) {
  case 'connect':
    args.unshift(client);
    break;
  case 'settings':
    args.unshift(client);
    break;
  default:
    args.unshift(client.connections[server]);
  }

  exports[command].apply(exports, args);
};

exports.away = function (connection, message) {
  message = utils.mergeArgs(arguments, 1);
  connection.away(message);
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

exports.invite = function (connection, nick, channel) {
  connection.invite(nick, channel);
};

exports.nick = function (connection, nick) {
  connection.nick(nick);
};

exports.privmsg = function (connection, target, message) {
  message = utils.mergeArgs(arguments, 2);
  connection.writeToServerBuffer('>' + target + '< ' + message);
  connection.privmsg(target, message);
};

exports.query = function (connection, nick) {
  connection.client.bufferManager.create({
    parent: connection.server,
    name: nick,
  }).switchTo();
};

exports.quit = function (connection, message) {
  message = utils.mergeArgs(arguments, 1);
  connection.quit(message);
};

exports.quote = function (connection, raw) {
  raw = utils.mergeArgs(arguments, 1);
  connection.write(raw);
};

exports.join = function (connection, channels, keys) {
  connection.join(channels, keys);
};

exports.part = function (connection, channel, message) {
  message = utils.mergeArgs(arguments, 2);
  connection.part(channel, message);
};

exports.settings = function (client) {
  client.bufferManager.create({
    name: 'settings',
    displayName: 'Settings',
    component: 'Settings'
  }).switchTo();
};
