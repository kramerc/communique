'use strict';

var path = require('path');
var BrowserWindow = require('browser-window');

var staticDir = path.resolve('static');
var initialUrl = 'file://' + staticDir + '/index.html';

function CommuniqueWindow() {
  this.browserWindow = new BrowserWindow({
    title: 'Communiqué',
    show: false,
    width: 800,
    height: 600
  });

  global.communiqueApp.addWindow(this);
  this.browserWindow.loadUrl(initialUrl);

  this.browserWindow.on('closed', function () {
    this.browserWindow = null;
    global.communiqueApp.removeWindow(this);
  });
}

module.exports = CommuniqueWindow;
