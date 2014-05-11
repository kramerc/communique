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

  var self = this;

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

  this.irc.on('message', function (event) {
    var buffer = (utils.isChannel(event.to)) ? event.to : event.from;

    // Ensure the buffer has been created
    self.client.createBuffer(self.network, buffer);

    // Relay the message to the renderer
    self.client.browserWindow.webContents.send('message:received', {
      buffer: {
        parent: self.network,
        name: (utils.isChannel(event.to)) ? event.to : event.from
      },
      message: {
        timestamp: Date.now(),
        from: event.from,
        message: event.message,
        to: event.to
      }
    });
  });
}

Connection.prototype.joinChannel = function (name) {
  this.irc.join(name);
  this.client.createBuffer({
    parent: this.network,
    name: name,
    switch: true
  });
};

module.exports = Connection;
