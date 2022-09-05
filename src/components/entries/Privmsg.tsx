import React from "react";
import { BufferEntry } from "../../irc/BufferEntry";
import Message from "./Message";

const Privmsg: React.FC<BufferEntry> = (props) => {
  return (
    <li>
      {props.nick && <span>&lt;{props.nick}&gt;</span>}{" "}
      <Message>{props.message}</Message>
    </li>
  );
};

export default Privmsg;
