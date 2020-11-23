import React from "react";
import { Link, Redirect, Route, Router, Switch, useLocation } from "react-router-dom";

import { About } from "./components/About";
import { Evaluate } from "./components/Evaluate";
import { Summarize } from "./components/Summarize";
import history from "./history.js";

const routes = [
  ["/summarize", "Summarize", Summarize],
  ["/evaluate", "Evaluate", Evaluate],
  ["/about", "About", About],
];

const App = () => (
  <Router history={history}>
    <Content routes={routes} />
  </Router>
);

const Content = ({ routes }) => {
  const base = window.location.protocol + "//" + window.location.hostname;
  const summary_viewer_url = new URL(
    process.env.REACT_APP_DEVELOP
      ? `${base}:4000/`
      : `${base}:${window.location.port}/summary_viewer/`
  );
  const location = useLocation();
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
            <ul className="uk-navbar-nav">
              <li>
                <a href={summary_viewer_url} target="_blank">
                  Summary Viewer
                </a>
              </li>
            </ul>
          </div>
          <div className="uk-navbar-right">
            <ul className="uk-navbar-nav">
              {routes.map(([path, readable, component]) => (
                <li key={path} className={path === location["pathname"] ? "uk-active" : null}>
                  <Link to={path}>{readable}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="uk-margin" />

      <Switch>
        {routes.map(([path, readable, component]) => (
          <Route key={location.key} path={path} component={component} />
        ))}
        <Redirect to={routes[0][0]} />
      </Switch>
      <div className="uk-margin-large-bottom" />
    </>
  );
};

export default App;
