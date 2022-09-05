import React, { useEffect, useRef, useState } from "react";
import { BufferEntry } from "../irc/BufferEntry";
import IrcBufferEntry from "./IrcBufferEntry";

export interface IrcBufferProps {
  buffer: string;
}

const IrcBuffer: React.FC<IrcBufferProps> = (props) => {
  const [entries, setEntries] = useState<BufferEntry[]>([]);
  const [input, setInput] = useState("");
  const entriesRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const callback: IpcBufferEventCallback = (ipcEvent, buffer, event) => {
      console.log("buffer entry", buffer, event);
      if (buffer !== props.buffer) {
        return;
      }

      setEntries((entries) => [...entries, JSON.parse(event) as BufferEntry]);
    };
    window.api.onBufferEntry(callback);

    return function cleanup() {
      window.api.offBufferEntry(callback);
    };
  }, [props.buffer]);

  useEffect(() => {
    void window.api.getBufferEntries(props.buffer).then((fetched) => {
      setEntries(fetched);
    });
  }, [props.buffer]);

  useEffect(() => {
    entriesRef.current?.scrollTo(0, entriesRef.current.scrollHeight);
  }, [entries]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    window.api
      .bufferSend(props.buffer, input)
      .then(() => {
        setInput("");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="flex flex-col w-full">
      <ul className="h-full p-2 overflow-auto" ref={entriesRef}>
        {entries.map((entry, index) => (
          <IrcBufferEntry key={index} {...entry} />
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="p-1">
        <input
          type="text"
          className="bg-transparent w-full p-1"
          placeholder={`Message ${props.buffer}`}
          onChange={(event) => setInput(event.currentTarget.value)}
          value={input}
        />
      </form>
    </div>
  );
};

export default IrcBuffer;
