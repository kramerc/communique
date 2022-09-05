import React from "react";
import { BufferEntry } from "../irc/BufferEntry";
import Action from "./entries/Action";
import Client from "./entries/Client";
import Notice from "./entries/Notice";
import Privmsg from "./entries/Privmsg";
import Wallops from "./entries/Wallops";

const IrcBufferEntry: React.FC<BufferEntry> = (props) => {
  switch (props.type) {
    case "action":
      return <Action {...props} />;
    case "notice":
      return <Notice {...props} />;
    case "privmsg":
      return <Privmsg {...props} />;
    case "wallops":
      return <Wallops {...props} />;
    case "client":
      return <Client {...props} />;
    default:
      return <li>{props.message}</li>;
  }
};

export default IrcBufferEntry;
