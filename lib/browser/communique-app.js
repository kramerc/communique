import app from 'app';
import CommuniqueWindow from './communique-window';

export default class CommuniqueApp {
  constructor () {
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

  static open() {
    return new CommuniqueApp();
  }

  addWindow(window) {
    this.windows.push(window);
  }

  removeWindow(window) {
    this.windows.splice(this.windows.indexOf(window), 1);
  }
}
