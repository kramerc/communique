import path from 'path';
import BrowserWindow from 'browser-window';

import IrcClient from './irc/client';

const staticDir = path.join(path.dirname(path.dirname(__dirname)), 'static');
const initialURL = 'file://' + staticDir + '/index.html';

export default function CommuniqueWindow() {
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

  this.browserWindow.webContents.once('did-finish-load', () => {
    // Create the default buffer
    this.ircClient.bufferManager.create({
      name: 'default',
      displayName: 'Communiqué',
      closable: false
    }).switchTo().write({
      message: 'Communiqué'
    });
  });

  this.browserWindow.on('closed', () => {
    this.browserWindow = null;
    global.communiqueApp.removeWindow(this);
  });
}
