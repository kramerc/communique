import { WebContents } from "electron";
import {
  Client,
  ConnectOpts,
  JoinEventArgs,
  MessageEventArgs,
  RegisteredEventArgs,
} from "irc-framework";
import { Buffer, BufferType } from "./Buffer";
import { BufferEntry } from "./BufferEntry";
import { IRC_NAMESPACE } from "./index";

export class Server {
  client: Client;
  webContents: WebContents;
  name: string;
  options: ConnectOpts;
  readonly buffers: Record<string, Buffer> = {};

  constructor(webContents: WebContents, name: string, options: ConnectOpts) {
    this.client = new Client();
    this.webContents = webContents;
    this.name = name;
    this.options = options;

    this.createBuffer(`^${this.name}`, BufferType.SERVER);

    this.client.on("registered", this.handleRegistered.bind(this));
    this.client.on("message", this.handleMessage.bind(this));
    this.client.on("join", this.handleJoin.bind(this));
  }

  connect() {
    this.client.connect(this.options);
  }

  get connected() {
    return this.client.connected;
  }

  get fullName() {
    return `${IRC_NAMESPACE}.${this.name}`;
  }

  get serverBuffer() {
    return this.buffers[`^${this.name}`];
  }

  get user() {
    return this.client.user;
  }

  join(channel: string, key?: string) {
    this.client.join(channel, key);
  }

  createBuffer(name: string, type: BufferType) {
    const buffer = new Buffer(this, name, type);
    this.buffers[name] = buffer;
    this.webContents.send("irc-buffer-created", buffer.fullName, "");
    return buffer;
  }

  private handleRegistered(event: RegisteredEventArgs) {
    // TODO: Don't hardcode channels
    this.join("#communique");
    this.webContents.send("irc-registered", JSON.stringify(event));
  }

  private handleMessage(event: MessageEventArgs) {
    const fromServer = event.from_server;
    const isQuery = event.target === this.user.nick;
    const bufferName = isQuery ? event.nick : event.target;
    let buffer = fromServer ? this.serverBuffer : this.buffers[bufferName];
    if (!buffer) {
      buffer = this.createBuffer(
        bufferName,
        isQuery ? BufferType.QUERY : BufferType.CHANNEL
      );
    }

    buffer.append(BufferEntry.fromMessageEvent(event));
    this.webContents.send("irc-message", JSON.stringify(event));
  }

  private handleJoin(event: JoinEventArgs) {
    const buffer = this.createBuffer(event.channel, BufferType.CHANNEL);
    buffer.append(
      BufferEntry.fromClientMessage("Now talking in " + event.channel)
    );
  }
}
