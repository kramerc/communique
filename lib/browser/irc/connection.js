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
    var buffer = this.client.bufferManager.find({
      parent: this.network,
      name: 'server'
    });

    if (buffer) {
      buffer.write(event.string);
    }
  }.bind(this));

  this.irc.on('message', function (event) {
    var name = (utils.isChannel(event.to)) ? event.to : event.from;

    // Write the message to the buffer
    this.client.bufferManager
      .findOrCreate({parent: this.network, name: name})
      .write(event);
  }.bind(this));

  this.irc.on('names', function (event) {
    // Sort the names
    var names = event.names.sort(function (a, b) {
      // Ignore case
      a = a.toLowerCase();
      b = b.toLowerCase();

      if (a > b) {
        return 1;
      }

      if (a < b) {
        return -1;
      }

      return 0;
    });

    this.client.browserWindow.webContents
      .send('buffer:names', {
        parent: this.network,
        name: event.channel
      }, names);
  }.bind(this));

  this.irc.on('nick', function (event) {
    if (event.nick === this.irc.me) {
      // WORKAROUND: slate-irc doesn't recognize forced nick changes
      this.irc.me = event.new;
    }

    if (event.new === this.irc.me) {
      this.client.browserWindow.webContents
        .send('connection:nick', this.network, event.new);
    }
  }.bind(this));

  this.irc.on('welcome', function (nick) {
    this.client.browserWindow.webContents
      .send('connection:nick', this.network, nick);
  }.bind(this));
}

Connection.prototype.join = function (names, keys) {
  this.irc.join(names, keys);
  names.split(',').forEach(function (name) {
    this.client.bufferManager.findOrCreate({
      parent: this.network,
      name: name
    }).switchTo();
  }.bind(this));
};

Connection.prototype.part = function (channel, message) {
  this.irc.part(channel, message);
  this.client.bufferManager.delete({parent: this.network, name: channel});
};

module.exports = Connection;
