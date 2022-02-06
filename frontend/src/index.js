import "uikit/dist/css/uikit.min.css";
import "uikit/dist/js/uikit.min";

import "./index.css";

import React from "react";
import ReactDom from "react-dom";

import App from "./App";

ReactDom.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
