import React from "react";
import { BufferEntry } from "../../irc/BufferEntry";
import Message from "./Message";

const Action: React.FC<BufferEntry> = (props) => {
  return (
    <li>
      <span>*</span> {props.nick && <span>&lt;${props.nick}&gt;</span>}{" "}
      <Message>{props.message}</Message>
    </li>
  );
};

export default Action;
