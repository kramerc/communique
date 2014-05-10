'use strict';

var path = require('path');
var BrowserWindow = require('browser-window');

var IrcClient = require('./irc/client');

var staticDir = path.join(path.dirname(path.dirname(__dirname)), 'static');
var initialUrl = 'file://' + staticDir + '/index.html';

function CommuniqueWindow() {
  var self = this;

  this.browserWindow = new BrowserWindow({
    title: 'Communiqué',
    show: false,
    width: 800,
    height: 600
  });

  global.communiqueApp.addWindow(this);
  this.browserWindow.loadUrl(initialUrl);

  // DEBUG:
  this.browserWindow.openDevTools();

  this.ircClient = new IrcClient(this.browserWindow);

  this.browserWindow.webContents.once('did-finish-load', function () {
    // DEBUG:
    self.ircClient.connect('EsperNet', {
      host: 'irc.esper.net',
      port: 6667,
      nick: 'Communique',
      username: 'communique',
      realname: 'Communique Test'
    });

    self.ircClient.connections.EsperNet.irc.once('motd', function () {
      self.ircClient.connections.EsperNet.joinChannel('#communique');
    });
  });

  this.browserWindow.on('closed', function () {
    this.browserWindow = null;
    global.communiqueApp.removeWindow(this);
  });
}

module.exports = CommuniqueWindow;
