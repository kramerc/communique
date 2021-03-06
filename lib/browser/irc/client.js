import {ipcMain} from 'electron';

import BufferManager from './buffer-manager';
import Connection from './connection';
import * as commands from './commands';
import * as utils from '../../utils';

export default class Client {
  constructor(browserWindow) {
    this.browserWindow = browserWindow;
    this.bufferManager = new BufferManager(this);
    this.connections = {};
    this.settings = {};

    ipcMain.on('buffer:requestClose', (event, buffer) => {
      if (buffer.name === 'server') {
        // Quit from IRC
        this.connections[buffer.parent].quit();

        // Delete all buffers related to the server
        this.bufferManager.deleteParent(buffer.parent);

        return;
      }

      if (utils.isChannel(buffer.name)) {
        // Part the channel
        this.connections[buffer.parent].part(buffer.name);

        return;
      }

      this.bufferManager.delete(buffer);
    });

    ipcMain.on('buffer:input', (event, msg) => {
      if (utils.isCommand(msg.message)) {
        commands.handle(this, msg.buffer.parent, msg.message);
      } else {
        this.connections[msg.buffer.parent].privmsg(
          msg.buffer.name, msg.message);
      }
    });

    ipcMain.on('settings', (event, settings) => {
      this.settings = settings;
    });
  }

  connect(server, options) {
    if (!options.nick) {
      options.nick = this.settings.nick;
    }

    if (!options.username) {
      options.username = this.settings.username;
    }

    if (!options.realname) {
      options.realname = this.settings.realname;
    }

    // Create a buffer for the server
    this.bufferManager.create({
      parent: server,
      name: 'server'
    }).switchTo();

    this.connections[server] = new Connection(this, server, options);
  }

  writeToDefaultBuffer(message) {
    this.bufferManager.findOrCreate({name: 'default'}).write(message);
  }
}
