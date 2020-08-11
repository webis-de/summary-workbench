import React from "react";

import { About } from "./components/About";
import { CompareEntry } from "./components/CompareEntry";
import { Summarize } from "./components/Summarize";

const App = () => (
  <>
  <div class="uk-background-secondary global-nav" data-uk-sticky>
    <nav class="uk-navbar-container uk-navbar-transparent uk-container uk-light" data-uk-navbar="mode: click">
      <div className="uk-navbar-item uk-logo uk-link-muted">
        <a href="/">Summarizer</a>
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
</div>

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
