import React, { useEffect, useState } from "react";

export interface IrcBufferListProps {
  onChange: (bufferName: string) => void;
}

const IrcBufferList: React.FC<IrcBufferListProps> = ({ onChange }) => {
  const [buffers, setBuffers] = useState<string[]>([]);

  useEffect(() => {
    void window.api.getBuffers().then((fetched) => {
      setBuffers(fetched);
    });
  }, []);

  useEffect(() => {
    const callback: IpcBufferEventCallback = (ipcEvent, buffer) => {
      setBuffers((buffers) => [...buffers, buffer]);
    };
    window.api.onBufferCreated(callback);

    return function cleanup() {
      window.api.offBufferCreated(callback);
    };
  }, []);

  return (
    <ul className="p-2">
      {buffers.map((fullName) => (
        <li key={fullName}>
          <a href="#" onClick={() => onChange(fullName)}>
            {fullName}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default IrcBufferList;
