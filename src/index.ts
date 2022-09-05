import { app, ipcMain, shell, BrowserWindow } from "electron";
import { Server } from "./irc/Server";
import { ConnectOpts } from "irc-framework";
import { IRC_NAMESPACE } from "./irc";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#384151",
      symbolColor: "#ffffff",
      height: 30,
    },
  });

  // and load the index.html of the app.
  void mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Open links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const servers: Record<string, Server> = {};

const getBufferFromFullName = (fullName: string) => {
  const [namespace, serverName, bufferName] = fullName.split(".");

  if (namespace !== IRC_NAMESPACE) {
    return Promise.reject(new Error(`Invalid namespace: ${namespace}`));
  }

  if (!servers[serverName]) {
    return Promise.reject(new Error(`Server not found: ${serverName}`));
  }

  if (!servers[serverName].buffers[bufferName]) {
    return Promise.reject(new Error(`Buffer not found: ${bufferName}`));
  }

  return Promise.resolve(servers[serverName].buffers[bufferName]);
};

ipcMain.on("irc-connect", (event, name: string, options: ConnectOpts) => {
  console.log("Connecting to IRC server", name, options);
  if (name in servers) {
    console.log("IRC server already exists", name);
    const server = servers[name];
    if (!server.connected) {
      console.log("IRC server is not connected, connecting", name);
      server.connect();
    }
    return;
  }

  const server = new Server(event.sender, name, options);
  server.connect();
  servers[name] = server;
});

ipcMain.handle(
  "irc-buffer-send",
  async (event, fullName: string, input: string) => {
    console.log("Sending to buffer", fullName, input);
    const buffer = await getBufferFromFullName(fullName);
    buffer.send(input);
  }
);

ipcMain.handle("irc-get-buffers", () => {
  const buffers: string[] = [];
  Object.values(servers).forEach((server) =>
    Object.values(server.buffers).forEach((buffer) =>
      buffers.push(buffer.fullName)
    )
  );
  return Promise.resolve(buffers);
});

ipcMain.handle("irc-get-buffer-entries", async (event, fullName: string) => {
  const buffer = await getBufferFromFullName(fullName);
  return buffer.entries;
});
