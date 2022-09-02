import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";

function render() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
}

render();
