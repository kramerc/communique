'use strict';

var app = require('app');
var CommuniqueWindow = require('./communique-window');

function CommuniqueApp() {
  global.communiqueApp = this;

  this.windows = [];

  app.focus();

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('ready', function () {
    var communiqueWindow = new CommuniqueWindow();
    communiqueWindow.browserWindow.show();
  });
}

CommuniqueApp.open = function () {
  return new CommuniqueApp();
};

CommuniqueApp.prototype.addWindow = function (window) {
  this.windows.push(window);
};

CommuniqueApp.prototype.removeWindow = function (window) {
  this.windows.splice(this.windows.indexOf(window), 1);
};

module.exports = CommuniqueApp;
