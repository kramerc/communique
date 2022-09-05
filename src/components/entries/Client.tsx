import React from "react";
import { BufferEntry } from "../../irc/BufferEntry";
import Message from "./Message";

const Client: React.FC<BufferEntry> = (props) => {
  return (
    <li>
      <span>*</span> <Message>{props.message}</Message>
    </li>
  );
};

export default Client;
