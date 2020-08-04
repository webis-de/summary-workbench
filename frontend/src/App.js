import React from "react";

import { About } from "./components/About";
import { CompareEntry } from "./components/CompareEntry";
import { Summarize } from "./components/Summarize";

const App = () => (
  <>
    <nav className="uk-navbar uk-navbar-container uk-margin">
      <div className="uk-navbar-item uk-logo uk-link-muted">
        <a href="/">Comparefile</a>
      </div>
      <div className="uk-navbar-left">
        <ul className="uk-navbar-nav" data-uk-switcher="connect: #main-switcher">
          <li>
            <a href="/#">Evaluate</a>
          </li>
          <li>
            <a href="/#">Summarize</a>
          </li>
        </ul>
      </div>
      <div className="uk-navbar-right">
        <ul className="uk-navbar-nav" data-uk-switcher="connect: #main-switcher">
          <li style={{ display: "none" }}>
            <a href="/#"> </a>
          </li>
          <li style={{ display: "none" }}>
            <a href="/#"> </a>
          </li>
          <li>
            <a href="/#">About</a>
          </li>
        </ul>
      </div>
    </nav>

    <ul id="main-switcher" className="uk-switcher uk-margin">
      <li>
        <CompareEntry />
      </li>
      <li>
        <Summarize />
      </li>
      <li>
        <About />
      </li>
    </ul>
    <div className="uk-margin-large-bottom" />
  </>
);

export default App;
