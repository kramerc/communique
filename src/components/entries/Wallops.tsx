import React from "react";
import { BufferEntry } from "../../irc/BufferEntry";
import Message from "./Message";

const Wallops: React.FC<BufferEntry> = (props) => {
  // TODO: Figure out formatting for Wallops
  return (
    <li>
      <span>*</span> <Message>{props.message}</Message>
    </li>
  );
};

export default Wallops;
