'use strict';

var events = require('events');
var ipcMain = require('electron').ipcMain;
var net = require('net');
var ircMessage = require('irc-message');
var parsePrefix = require('irc-prefix-parser');
var replies = require('irc-replies');
var util = require('util');

var utils = require('../../utils');

function Connection(client, server, options) {
  // Ensure required options are present
  var requiredOptions = ['host', 'port', 'nick', 'username', 'realname'];
  var missingOptions = [];

  requiredOptions.forEach(function (option) {
    if (!options[option]) {
      missingOptions.push(option);
    }
  });

  if (missingOptions.length > 0) {
    throw new Error('Missing required option(s): ' + missingOptions.join(', '));
  }

  this.client = client;
  this.server = server;
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
    var prevData;

    this.stream.on('data', function (data) {
      data.toString().split('\r\n').forEach(function (line) {
        var message, command;

        if (!line) {
          return;
        }

        // Append any previous data that may have been kept
        if (prevData) {
          line = prevData + line;
          prevData = null;
        }

        message = ircMessage.parse(line);
        if (typeof message.prefix !== 'undefined' && message.prefix !== null) {
          message.prefix = parsePrefix(message.prefix);
        }

        if (!message) {
          // May be missing the last part of the message
          prevData = line;
          return;
        }

        command = replies[message.command] || message.command;

        this.emit(command, message);
      }.bind(this));
    }.bind(this));
  }).call(this);

  // Handle MOTD replies
  (function () {
    var motd = [];

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
    var names = {};

    this.on('RPL_NAMREPLY', function (message) {
      var channel = message.params[2];
      var nicks = message.params[3].split(' ');

      names[channel] = [];

      nicks.forEach(function (nick) {
        var mode = nick.match(/([@+])/);
        if (mode) {
          mode = mode[0];
          nick = nick.replace(mode, '');
        }
        names[channel].push({mode: mode, name: nick});
      });
    }).on('RPL_ENDOFNAMES', function (message) {
      var channel = message.params[1];
      this.client.bufferManager
        .findOrCreate({parent: this.server, name: channel})
        .names(names[channel]);
      delete names[channel];
    });
  }).call(this);

  // Core message listeners
  this.on('ERROR', function (message) {
    this.writeToServerBuffer(message.params[0]);
  }).on('INVITE', function (message) {
    var from = message.prefix.nick;
    var channel = message.params[1];

    this.writeToServerBuffer(from + ' invites you to join ' + channel);
  }).on('NICK', function (message) {
    var prev = message.prefix.nick;
    var now = message.params[0];

    if (prev === this.currentNick) {
      this.currentNick = now;
      this.sendToRenderer('connection:nick', this.server, this.currentNick);
    }
  }).on('NOTICE', function (message) {
    var to = message.params[0];
    var prefix = message.prefix;

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
    var nick = message.prefix.nick;
    var name = utils.isChannel(message.params[0]) ? message.params[0] : nick;

    // Write the message to the buffer
    this.client.bufferManager
      .findOrCreate({parent: this.server, name: name})
      .write({
        from: nick,
        message: message.params[1],
        to: message.params[0]
      });
  });

  // Attach a default listener for each reply
  var writeReplyListener = function (message) {
    if (events.EventEmitter.listenerCount(this, replies[message.command]) > 1) {
      // Another listener is attached
      return;
    }

    message.params.splice(0, 1);
    this.writeToServerBuffer(message.params.join(' '));
  };
  for (var reply in replies) {
    if (replies.hasOwnProperty(reply)) {
      this.on(replies[reply], writeReplyListener);
    }
  }

  // Listen for connection IPC events
  ipcMain.on('connection:requestNick', function (event, server) {
    if (server === this.server) {
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
      parent: this.server,
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
    parent: this.server,
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
  var buffer = this.client.bufferManager.find({
    parent: this.server,
    name: 'server'
  });

  if (buffer) {
    buffer.write(message);
  }
};

module.exports = Connection;
