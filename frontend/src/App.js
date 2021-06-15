import React, {useContext} from "react";
import { FaCog } from "react-icons/fa";
import { Link, Redirect, Route, Router, Switch, useLocation } from "react-router-dom";

import { About } from "./components/About";
import { Evaluate } from "./components/Evaluate";
import { Summarize } from "./components/Summarize";
import { VisualizationOverview } from "./components/Visualize";
import { MetricsProvider } from "./contexts/MetricsContext";
import { SummarizersProvider } from "./contexts/SummarizersContext";
import { SettingsProvider, SettingsContext } from "./contexts/SettingsContext"
import history from "./history";

const App = () => (
  <MetricsProvider>
    <SummarizersProvider>
      <SettingsProvider>
        <Router history={history}>
          <Content />
        </Router>
      </SettingsProvider>
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
  const {minOverlap, setMinOverlap} = useContext(SettingsContext)
  return (
    <>
      <div className="uk-background-secondary global-nav uk-flex" data-uk-sticky>
        <nav
          className="uk-navbar-container uk-navbar-transparent uk-container uk-light"
          data-uk-navbar="mode: click"
          style={{ flex: "1 0" }}
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
        <div className="uk-flex uk-flex-center" style={{ marginLeft: "0px", marginRight: "50px" }}>
          <FaCog className="hover-gray" style={{ minWidth: "20px" }} />
          <div uk-dropdown="mode: click; pos:  bottom-left">
            <h4>minimal overlap</h4>
            <div className="margin-between-20">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num} style={{ whiteSpace: "nowrap" }}>
                  {num}
                  <input type="radio" value={num} checked={num === minOverlap} onChange={(e) => setMinOverlap(e.target.value)} />
                </label>
              ))}
            </div>
          </div>
        </div>
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
