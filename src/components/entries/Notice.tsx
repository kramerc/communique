import React from "react";
import { BufferEntry } from "../../irc/BufferEntry";
import Message from "./Message";

const Notice: React.FC<BufferEntry> = (props) => {
  return (
    <li>
      {props.nick && <span>-{props.nick}-</span>}{" "}
      <Message>{props.message}</Message>
    </li>
  );
};

export default Notice;
