import React from "react";
import { Link, Redirect, Route, Router, Switch, useLocation } from "react-router-dom";

import { About } from "./components/About";
import { Evaluate } from "./components/Evaluate";
import { Summarize } from "./components/Summarize";
import { VisualizationOverview } from "./components/Visualize";
import { MetricsProvider } from "./contexts/MetricsContext";
import { SummarizersProvider } from "./contexts/SummarizersContext";
import history from "./history";

const App = () => (
  <MetricsProvider>
    <SummarizersProvider>
      <Router history={history}>
        <Content />
      </Router>
    </SummarizersProvider>
  </MetricsProvider>
);

const Content = () => {
  const routes = [
    ["/summarize", "Summarize", Summarize],
    ["/evaluate", "Evaluate", Evaluate],
    ["/visualize", "Visualize", VisualizationOverview],
    ["/about", "About", About],
  ];

  const location = useLocation();
  return (
    <>
      <div className="uk-background-secondary global-nav" data-uk-sticky>
        <nav
          className="uk-navbar-container uk-navbar-transparent uk-container uk-light"
          data-uk-navbar="mode: click"
        >
          <div className="uk-navbar-item uk-logo">
            <a href="/">TL;DR</a>
          </div>
          <div className="uk-navbar-right">
            <ul className="uk-navbar-nav">
              {routes.map(([path, readable]) => (
                <li key={path} className={path === location.pathname ? "uk-active" : null}>
                  <Link to={path}>{readable}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="uk-margin" />

      <Switch>
        {routes.map(([path, , component]) => (
          <Route key={location.key} path={path} component={component} />
        ))}
        <Redirect to={routes[0][0]} />
      </Switch>
      <div className="uk-margin-large-bottom" />
    </>
  );
};

export default App;
