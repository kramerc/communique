'use strict';

var ipc = require('ipc');
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
    // DEBUG: Create channel buffers
    self.ircClient.createBuffer('EsperNet', '#communique');
    self.ircClient.createBuffer('EsperNet', '#communique2');

    // DEBUG: Send a message every second
    var counter = 0;
    setInterval(function () {
      self.browserWindow.webContents.send('message:received', {
        buffer: {
          parent: 'EsperNet',
          name: '#communique'
        },
        message: {
          from: 'Kramer',
          message: 'Test message #' + (++counter),
          to: '#communique'
        }
      });
    }, 1000);

    ipc.on('irc', function (event, message) {
      console.log('<%s> %s', message.from, message.message);
    });
  });

  this.browserWindow.on('closed', function () {
    this.browserWindow = null;
    global.communiqueApp.removeWindow(this);
  });
}

module.exports = CommuniqueWindow;
