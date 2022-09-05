import React from "react";
import Linkify from "linkify-react";

const Message: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Linkify options={{ target: "_blank" }}>{children}</Linkify>;
};

export default Message;
