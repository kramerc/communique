import Server from './server';

import dateFormat from 'dateformat';
import events from 'events';
import {ipcMain} from 'electron';
import net from 'net';
import ircMessage from 'irc-message';
import parsePrefix from 'irc-prefix-parser';
import replies from 'irc-replies';
import util from 'util';

import * as utils from '../../utils';

export default function Connection(client, serverName, options) {
  // Ensure required options are present
  let requiredOptions = ['host', 'port', 'nick', 'username', 'realname'];
  let missingOptions = [];

  requiredOptions.forEach(function (option) {
    if (!options[option]) {
      missingOptions.push(option);
    }
  });

  if (missingOptions.length > 0) {
    throw new Error('Missing required option(s): ' + missingOptions.join(', '));
  }

  this.client = client;
  this.server = new Server(serverName);
  this.currentNick = options.nick;

  this.stream = net.connect({
    host: options.host,
    port: options.port
  });
  this.stream.setEncoding('utf8');

  this.stream.on('connect', function () {
    if (options.pass) {
      this.write('PASS ' + options.pass);
    }
    this.write('NICK ' + options.nick);
    this.write('USER ' + options.username + ' 8 * :' + options.realname);
  }.bind(this));

  (function () {
    let prevData;

    this.stream.on('data', function (data) {
      data.toString().split('\r\n').forEach(function (line) {
        let message, command;

        if (!line) {
          return;
        }

        // Append any previous data that may have been kept
        if (prevData) {
          line = prevData + line;
          prevData = null;
        }

        message = ircMessage.parse(line);
        if (!message) {
          // May be missing the last part of the message
          prevData = line;
          return;
        }

        if (typeof message.prefix !== 'undefined' && message.prefix !== null) {
          message.prefix = parsePrefix(message.prefix);
        }

        command = replies[message.command] || message.command;

        this.emit(command, message);
      }.bind(this));
    }.bind(this));
  }).call(this);

  // Handle ISUPPORT replies
  this.on('RPL_ISUPPORT', (message) => {
    // Copy the params array
    let params = message.params.slice();

    // The first param and the last param are unneeded. The first param contains
    // our nick, the last param simply states "are supported by this server"
    params.shift();
    params.pop();

    params.forEach((param) => {
      let [key, value] = param.split('=');
      if (!value) {
        value = true;
      }
      this.server.recordSupport(key, value);
    });

    writeReply(message);
  });

  // Handle MOTD replies
  (function () {
    let motd = [];

    this.on('RPL_MOTDSTART', function () {
      motd = [];
    }).on('RPL_MOTD', function (message) {
      motd.push(message.params[1]);
    }).on('RPL_ENDOFMOTD', function (message) {
      motd.push(message.params[1]);
      motd.forEach(function (line) {
        if (line) {
          this.writeToServerBuffer(line);
        }
      }.bind(this));
    });
  }).call(this);

  // Handle NAMES replies
  (function () {
    let channels = {};

    this.on('RPL_NAMREPLY', function (message) {
      let channel = message.params[2];
      let nicks = message.params[3].split(' ');
      let prefixesStr = this.server.prefixes.join('');

      // Place names into a group for each prefix
      if (!channels[channel]) {
        channels[channel] = {
          names: {}
        };
        this.server.prefixes.forEach((prefix) => {
          channels[channel].names[prefix] = [];
        });
      }

      nicks.forEach(function (nick) {
        let prefix = nick.match(new RegExp('([' + prefixesStr + '])'));
        if (prefix) {
          prefix = prefix[1];
          nick = nick.replace(prefix, '');
        } else {
          prefix = '';
        }
        channels[channel].names[prefix].push(nick);
      });
    }).on('RPL_ENDOFNAMES', function (message) {
      let channel = message.params[1];

      // Sort names in each prefix group and push each name onto a flat array of
      // names
      let names = [];
      this.server.prefixes.forEach((prefix) => {
        let sortedNames = channels[channel].names[prefix].sort();
        sortedNames.forEach((name) => {
          names.push({prefix: prefix, name: name});
        });
      });

      this.client.bufferManager
        .findOrCreate({parent: this.server.name, name: channel})
        .names(names);
      delete channels[channel];
    });
  }).call(this);

  // Handle topics
  let topicHandler = (channel, topic) => {
    this.client.bufferManager
      .findOrCreate({parent: this.server.name, name: channel})
      .topic(topic);
  };

  this.on('TOPIC', (message) => {
    let channel = message.params[0];
    let topic = message.params[1];
    let from = message.prefix.isServer ? message.prefix.host : message.prefix.nick;

    topicHandler(channel, topic);
    let buffer = this.client.bufferManager
      .findOrCreate({parent: this.server.name, name: channel});

    if (topic.length > 0) {
      buffer.write(from + ' changed the topic for ' + channel + ' to "' + topic + '"');
    } else {
      buffer.write(from + ' unset the topic for ' + channel);
    }
  }).on('RPL_NOTOPIC', (message) => {
    let channel = message.params[1];

    this.client.bufferManager
      .findOrCreate({parent: this.server.name, name: channel})
      .write('No topic set for ' + channel);
  }).on('RPL_TOPIC', (message) => {
    let channel = message.params[1];
    let topic = message.params[2];

    topicHandler(channel, topic);
    this.client.bufferManager
      .findOrCreate({parent: this.server.name, name: channel})
      .write('Topic for ' + channel + ' is "' + topic + '"');
  }).on('RPL_TOPIC_WHO_TIME', (message) => {
    let channel = message.params[1];
    let prefix = parsePrefix(message.params[2]);
    let from = prefix.isServer ? prefix.host : prefix.nick;
    let timestamp = new Date(parseInt(message.params[3], 10) * 1000);

    this.client.bufferManager
      .findOrCreate({parent: this.server.name, name: channel})
      .write('Topic set by ' + from + ' on ' + dateFormat(timestamp));
  });

  // Core message listeners
  this.on('ERROR', function (message) {
    this.writeToServerBuffer(message.params[0]);
  }).on('INVITE', function (message) {
    let from = message.prefix.nick;
    let channel = message.params[1];

    this.writeToServerBuffer(from + ' invites you to join ' + channel);
  }).on('NICK', function (message) {
    let prev = message.prefix.nick;
    let now = message.params[0];

    if (prev === this.currentNick) {
      this.currentNick = now;
      this.sendToRenderer('connection:nick', this.server.name, this.currentNick);
    }
  }).on('NOTICE', function (message) {
    let to = message.params[0];
    let prefix = message.prefix;

    if (to === '*' || to === this.currentNick) {
      this.writeToServerBuffer({
        from: prefix.isServer ? prefix.host : prefix.nick,
        message: message.params[1],
        notice: true
      });
    }
  }).on('PING', function (message) {
    this.write('PONG :' + message.params[0]);
  }).on('PRIVMSG', function (message) {
    let nick = message.prefix.nick;
    let name = utils.isChannel(message.params[0]) ? message.params[0] : nick;

    // Write the message to the buffer
    this.client.bufferManager
      .findOrCreate({parent: this.server.name, name: name})
      .write({
        from: nick,
        message: message.params[1],
        to: message.params[0]
      });
  });

  let writeReply = function (message) {
    message.params.splice(0, 1);
    this.writeToServerBuffer(message.params.join(' '));
  }.bind(this);

  // Attach a default listener for each reply
  let writeReplyListener = function (message) {
    if (events.EventEmitter.listenerCount(this, replies[message.command]) > 1) {
      // Another listener is attached
      return;
    }

    writeReply(message);
  };
  for (let reply in replies) {
    if (replies.hasOwnProperty(reply)) {
      this.on(replies[reply], writeReplyListener);
    }
  }

  // Listen for connection IPC events
  ipcMain.on('connection:requestNick', function (event, server) {
    if (server === this.server.name) {
      this.sendToRenderer('connection:nick', server, this.currentNick);
    }
  }.bind(this));
}

util.inherits(Connection, events.EventEmitter);

Connection.prototype.away = function (message) {
  this.write('AWAY :' + (message || ''));
};

Connection.prototype.invite = function (nick, channel) {
  this.write('INVITE ' + nick + ' ' + channel);
};

Connection.prototype.join = function (channels, keys) {
  this.write('JOIN ' + channels + ' ' + keys);
  channels.split(',').forEach(function (channel) {
    this.client.bufferManager.findOrCreate({
      parent: this.server.name,
      name: channel
    }).switchTo();
  }.bind(this));
};

Connection.prototype.nick = function (nick) {
  this.write('NICK ' + nick);
};

Connection.prototype.notice = function (target, message) {
  this.write('NOTICE ' + target + ' :' + message);
};

Connection.prototype.oper = function (name, password) {
  this.write('OPER ' + name + ' ' + password);
};

Connection.prototype.part = function (channel, message) {
  this.write('PART ' + channel + ' :' + message);
  this.client.bufferManager.delete({
    parent: this.server.name,
    name: channel
  });
};

Connection.prototype.privmsg = function (target, message) {
  this.write('PRIVMSG ' + target + ' :' + message);
};

Connection.prototype.quit = function (message) {
  this.write('QUIT :' + message);
};

Connection.prototype.sendToRenderer = function () {
  this.client.browserWindow.webContents.send.apply(
    this.client.browserWindow.webContents, arguments
  );
};

Connection.prototype.topic = function (channel, topic) {
  this.write('TOPIC ' + channel + ((topic) ? ' :' + topic : ''));
};

Connection.prototype.who = function (mask, o) {
  this.write('WHO ' + (mask || '') + ' ' + (o || ''));
};

Connection.prototype.whois = function (target, mask) {
  this.write('WHOIS ' + target + ' ' + mask);
};

Connection.prototype.write = function (data) {
  this.stream.write(data + '\r\n');
};

Connection.prototype.writeToServerBuffer = function (message) {
  let buffer = this.client.bufferManager.find({
    parent: this.server.name,
    name: 'server'
  });

  if (buffer) {
    buffer.write(message);
  }
};
