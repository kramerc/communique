import React from "react";
import classNames from "classnames";
import AppTitle from "./AppTitle";

import styles from "./TitleBar.module.css";

declare global {
  interface Navigator {
    windowControlsOverlay: WindowControlsOverlay;
  }

  interface WindowControlsOverlay {
    visible: boolean;
    getTitlebarAreaRect: () => DOMRect;
    addEventListener: (
      type: string,
      callback: (event: WindowControlsOverlay) => void
    ) => void;
  }
}

const TitleBar: React.FC = () => {
  return (
    <div className="bg-gray-800 border-b-gray-800 pb-0.5">
      <div className={classNames(styles.titleBar, "flex items-center px-2")}>
        <AppTitle />
      </div>
    </div>
  );
};

export default TitleBar;
