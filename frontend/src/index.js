import React from 'react';
import ReactDom from "react-dom";

import App from "./App.js";

import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css'
import "uikit/dist/css/uikit.min.css";
import "uikit/dist/js/uikit";


ReactDom.render(<App />, document.getElementById("root"));
