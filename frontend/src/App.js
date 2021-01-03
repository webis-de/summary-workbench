import React, { useContext } from "react";
import { Link, Redirect, Route, Router, Switch, useLocation } from "react-router-dom";

import { About } from "./components/About";
import { Evaluate } from "./components/Evaluate";
import { LoginButton, LogoutButton } from "./components/Login";
import { Summarize } from "./components/Summarize";
import { VisualizationOverview } from "./components/Visualize";
import { UserContext, UserProvider } from "./contexts/UserContext";
import history from "./history";

const App = () => (
  <UserProvider>
    <Router history={history}>
      <Content />
    </Router>
  </UserProvider>
);

const UserSection = () => {
  const { loggedin } = useContext(UserContext);
  if (loggedin) return <LogoutButton className="uk-navbar-item" style={{ marginLeft: "50px" }} />;
  return <LoginButton className="uk-navbar-item" style={{ marginLeft: "50px" }} />;
};

const Content = () => {
  const { loggedin } = useContext(UserContext);
  const routes = [
    ["/summarize", "Summarize", Summarize, true],
    ["/evaluate", "Evaluate", Evaluate, true],
    ["/visualize", "Visualize", VisualizationOverview, loggedin],
    ["/about", "About", About, true],
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
            <a href="/">Webis Summarization</a>
          </div>
          <div className="uk-navbar-right">
            <ul className="uk-navbar-nav">
              {routes.map(([path, readable, , enabled]) => (
                <li key={path} className={path === location.pathname ? "uk-active" : null}>
                  {enabled ? (
                    <Link to={path}>{readable}</Link>
                  ) : (
                    <a
                      href="/#"
                      onClick={(e) => e.preventDefault()}
                      data-uk-tooltip="title: you need to login to use this feature; pos: bottom;"
                    >
                      {readable}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <ul className="uk-navbar-nav">
            <li>
              <UserSection />
            </li>
          </ul>
        </nav>
      </div>

      <div className="uk-margin" />

      <Switch>
        {routes
          .filter(([, , , enabled]) => enabled)
          .map(([path, , component]) => (
            <Route key={location.key} path={path} component={component} />
          ))}
        <Redirect to={routes[0][0]} />
      </Switch>
      <div className="uk-margin-large-bottom" />
    </>
  );
};

export default App;
