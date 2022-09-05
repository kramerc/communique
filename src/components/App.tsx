import React, { useEffect, useState } from "react";
import TitleBar from "./TitleBar";
import IrcBuffer from "./IrcBuffer";

import styles from "./App.module.css";
import IrcBufferList from "./IrcBufferList";

const App: React.FC = () => {
  const [activeBuffer, setActiveBuffer] = useState("");

  useEffect(() => {
    const callback: IpcEventCallback = (ipcEvent, event) => {
      console.log("registered", event);
    };
    window.api.onRegistered(callback);

    return function cleanup() {
      window.api.offRegistered(callback);
    };
  }, []);

  const handleBufferChange = (bufferName: string) => {
    setActiveBuffer(bufferName);
  };

  return (
    <div>
      <header>
        <TitleBar />
      </header>
      <main className={styles.main}>
        <div className="flex h-full">
          <IrcBufferList onChange={handleBufferChange} />
          <IrcBuffer buffer={activeBuffer} />
        </div>
      </main>
    </div>
  );
};

export default App;
