'use strict';

var irc = require('slate-irc');
var net = require('net');

var utils = require('../../utils');

function Connection(client, network, options) {
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
  this.network = network;

  this.stream = net.connect({
    host: options.host,
    port: options.port
  });

  this.irc = irc(this.stream);

  if (options.pass) {
    this.irc.pass(options.pass);
  }

  this.irc.nick(options.nick);
  this.irc.user(options.username, options.realname);

  this.irc.on('data', function (event) {
    this.client.browserWindow.webContents.send('message:received', {
      buffer: {
        parent: this.network,
        name: 'server'
      },
      message: {
        timestamp: Date.now(),
        message: event.string
      }
    });
  }.bind(this));

  this.irc.on('message', function (event) {
    var buffer = (utils.isChannel(event.to)) ? event.to : event.from;

    // Ensure the buffer has been created
    this.client.createBuffer({
      parent: this.network,
      name: buffer
    });

    // Relay the message to the renderer
    this.client.browserWindow.webContents.send('message:received', {
      buffer: {
        parent: this.network,
        name: (utils.isChannel(event.to)) ? event.to : event.from
      },
      message: {
        timestamp: Date.now(),
        from: event.from,
        message: event.message,
        to: event.to
      }
    });
  }.bind(this));
}

Connection.prototype.join = function (names, keys) {
  this.irc.join(names, keys);
  names.split(',').forEach(function (name) {
    this.client.createBuffer({
      parent: this.network,
      name: name,
      switch: true
    });
  }.bind(this));
};

Connection.prototype.part = function (channel, message) {
  this.irc.part(channel, message);
  this.client.deleteBuffer({
    parent: this.network,
    name: channel,
  });
};

module.exports = Connection;
