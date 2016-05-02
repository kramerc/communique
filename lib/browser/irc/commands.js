import * as utils from '../../utils';

export function handle(client, server, message) {
  let args = message.split(' ');
  let command = args.splice(0, 1)[0].substring(1).toLowerCase();

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
}

export function away(connection, message) {
  message = utils.mergeArgs(arguments, 1);
  connection.away(message);
}

/**
 * Connects to an IRC server.
 *
 * /connect <host> [<port> [<pass>]]
 */
export function connect(client, host, port, pass) {
  client.connect(host, {
    host: host,
    port: parseInt(port) || 6667,
    pass: pass
  });
}

export function invite(connection, nick, channel) {
  connection.invite(nick, channel);
}

export function nick(connection, nick) {
  connection.nick(nick);
}

export function notice(connection, target, message) {
  message = utils.mergeArgs(arguments, 2);
  connection.writeToServerBuffer('-> -' + target + '- ' + message);
  connection.notice(target, message);
}

export function oper(connection, name, password) {
  connection.oper(name, password);
}

export function privmsg(connection, target, message) {
  message = utils.mergeArgs(arguments, 2);
  connection.writeToServerBuffer('>' + target + '< ' + message);
  connection.privmsg(target, message);
}

export function query(connection, nick) {
  connection.client.bufferManager.create({
    parent: connection.server,
    name: nick
  }).switchTo();
}

export function quit(connection, message) {
  message = utils.mergeArgs(arguments, 1);
  connection.quit(message);
}

export function quote(connection, raw) {
  raw = utils.mergeArgs(arguments, 1);
  connection.write(raw);
}

export function join(connection, channels, keys) {
  connection.join(channels, keys);
}

export function part(connection, channel, message) {
  message = utils.mergeArgs(arguments, 2);
  connection.part(channel, message);
}

export function settings(client) {
  client.bufferManager.create({
    name: 'settings',
    displayName: 'Settings',
    component: 'Settings'
  }).switchTo();
}

export function topic(connection, channel, topic) {
  topic = utils.mergeArgs(arguments, 2);
  connection.topic(channel, topic);
}

export function who(connection, mask, o) {
  connection.who(mask, o);
}

export function whois(connection, target, mask) {
  if (!mask) {
    // Pass the argument over to mask and keep it in target as IRC servers
    // typically interpret the nick as the remote server the user of that nick
    // is connected on. This allows for obtaining information kept by the remote
    // server such as user's idle time and the user's away status.
    mask = target;
  }

  connection.whois(target, mask);
}
