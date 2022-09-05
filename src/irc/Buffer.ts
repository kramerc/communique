import { Server } from "./Server";
import { BufferEntry } from "./BufferEntry";

export enum BufferType {
  SERVER,
  CHANNEL,
  QUERY,
}

export class Buffer {
  server: Server;
  name: string;
  type: BufferType;
  entries: BufferEntry[] = [];

  constructor(server: Server, name: string, type: BufferType) {
    this.server = server;
    this.name = name;
    this.type = type;
  }

  get fullName() {
    return `${this.server.fullName}.${this.name}`;
  }

  get target() {
    return this.name;
  }

  append(entry: BufferEntry) {
    this.entries.push(entry);
    this.server.webContents.send(
      "irc-buffer-entry",
      this.fullName,
      JSON.stringify(entry)
    );
  }

  send(input: string) {
    const { hostname, ident, nick } = this.server.user;

    if (this.type === BufferType.SERVER) {
      // TODO: Handle server commands
    } else {
      this.server.client.say(this.target, input);
      this.append(
        new BufferEntry(
          "privmsg",
          hostname,
          ident,
          input,
          nick,
          {},
          this.target,
          Date.now()
        )
      );
    }
  }
}
