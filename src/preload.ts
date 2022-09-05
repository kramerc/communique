// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { ConnectOpts } from "irc-framework";
import { BufferEntry } from "./irc/BufferEntry";

declare global {
  interface Window {
    api: CommuniqueApi;
  }

  type IpcEventCallback = (
    ipcEvent: Electron.IpcRendererEvent,
    event: string
  ) => void;

  type IpcBufferEventCallback = (
    ipcEvent: Electron.IpcRendererEvent,
    buffer: string,
    event: string
  ) => void;

  interface CommuniqueApi {
    connect: (name: string, options: ConnectOpts) => void;
    bufferSend: (fullName: string, input: string) => Promise<void>;
    getBuffers: () => Promise<string[]>;
    getBufferEntries: (fullName: string) => Promise<BufferEntry[]>;
    onRegistered: (callback: IpcEventCallback) => void;
    offRegistered: (callback: IpcEventCallback) => void;
    onMessage: (callback: IpcEventCallback) => void;
    offMessage: (callback: IpcEventCallback) => void;
    onBufferCreated: (callback: IpcBufferEventCallback) => void;
    offBufferCreated: (callback: IpcBufferEventCallback) => void;
    onBufferEntry: (callback: IpcBufferEventCallback) => void;
    offBufferEntry: (callback: IpcBufferEventCallback) => void;
  }
}

contextBridge.exposeInMainWorld("api", {
  connect: (name, options) => ipcRenderer.send("irc-connect", name, options),
  bufferSend: (fullName, input) =>
    ipcRenderer.invoke("irc-buffer-send", fullName, input),
  getBuffers: () => ipcRenderer.invoke("irc-get-buffers"),
  getBufferEntries: (fullName) =>
    ipcRenderer.invoke("irc-get-buffer-entries", fullName),
  onRegistered: (callback) => ipcRenderer.on("irc-registered", callback),
  offRegistered: (callback) => ipcRenderer.off("irc-registered", callback),
  onMessage: (callback) => ipcRenderer.on("irc-message", callback),
  offMessage: (callback) => ipcRenderer.off("irc-message", callback),
  onBufferCreated: (callback) => ipcRenderer.on("irc-buffer-created", callback),
  offBufferCreated: (callback) =>
    ipcRenderer.off("irc-buffer-created", callback),
  onBufferEntry: (callback) => ipcRenderer.on("irc-buffer-entry", callback),
  offBufferEntry: (callback) => ipcRenderer.off("irc-buffer-entry", callback),
} as CommuniqueApi);
