'use strict';

var path = require('path');
var BrowserWindow = require('browser-window');

var IrcClient = require('./irc/client');

var staticDir = path.join(path.dirname(path.dirname(__dirname)), 'static');
var initialURL = 'file://' + staticDir + '/index.html';

function CommuniqueWindow() {
  this.browserWindow = new BrowserWindow({
    title: 'Communiqué',
    show: false,
    width: 1200,
    height: 800
  });

  global.communiqueApp.addWindow(this);
  this.browserWindow.loadURL(initialURL);

  // DEBUG:
  this.browserWindow.openDevTools();

  this.ircClient = new IrcClient(this.browserWindow);

  this.browserWindow.webContents.once('did-finish-load', function () {
    // Create the default buffer
    this.ircClient.bufferManager.create({
      name: 'default',
      displayName: 'Communiqué',
      closable: false
    }).switchTo().write({
      message: 'Communiqué'
    });
  }.bind(this));

  this.browserWindow.on('closed', function () {
    this.browserWindow = null;
    global.communiqueApp.removeWindow(this);
  });
}

module.exports = CommuniqueWindow;
