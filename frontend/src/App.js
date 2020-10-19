import React from "react";

import { About } from "./components/About";
import { CompareEntry } from "./components/CompareEntry";
import { Summarize } from "./components/Summarize";

const App = () => {
  const base = window.location.protocol + "//" + window.location.hostname;
  const summary_viewer_url = new URL(
    process.env.REACT_APP_DEVELOP
      ? `${base}:4000/`
      : `${base}:${window.location.port}/summary_viewer/`
  );
  return (
    <>
      <div className="uk-background-secondary global-nav" data-uk-sticky>
        <nav
          className="uk-navbar-container uk-navbar-transparent uk-container uk-light"
          data-uk-navbar="mode: click"
        >
          <div className="uk-navbar-item uk-logo">
            <a href="/">Webis Summarization</a>
          </div>
          <div className="uk-navbar-center">
            <a href={summary_viewer_url} target="_blank">
              Summary Viewer
            </a>
          </div>
          <div className="uk-navbar-right">
            <ul className="uk-navbar-nav" data-uk-switcher="connect: #main-switcher">
              <li>
                <a href="/#">Summarize</a>
              </li>
              <li>
                <a href="/#">Evaluate</a>
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
          <Summarize />
        </li>
        <li>
          <CompareEntry />
        </li>
        <li>
          <About />
        </li>
      </ul>
      <div className="uk-margin-large-bottom" />
    </>
  );
};

export default App;
