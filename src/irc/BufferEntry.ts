import { MessageEventArgs } from "irc-framework";

export class BufferEntry {
  type: "client" | "privmsg" | "action" | "notice" | "wallops";
  hostname: string;
  ident: string;
  message: string;
  nick: string;
  tags: Record<string, string>;
  target: string;
  time?: number;

  constructor(
    type: "client" | "privmsg" | "action" | "notice" | "wallops",
    hostname: string,
    ident: string,
    message: string,
    nick: string,
    tags: Record<string, string>,
    target: string,
    time?: number
  ) {
    this.type = type;
    this.hostname = hostname;
    this.ident = ident;
    this.message = message;
    this.nick = nick;
    this.tags = tags;
    this.target = target;
    this.time = time;
  }

  static fromMessageEvent(event: MessageEventArgs) {
    return new BufferEntry(
      event.type,
      event.hostname,
      event.ident,
      event.message,
      event.nick,
      event.tags,
      event.target,
      event.time
    );
  }

  static fromClientMessage(message: string) {
    return new BufferEntry("client", "", "", message, "", {}, "", Date.now());
  }

  static fromInput(input: string) {
    return new BufferEntry("privmsg", "", "", input, "", {}, "", Date.now());
  }
}
