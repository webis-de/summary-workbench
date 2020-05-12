import { createBrowserHistory } from "history";
import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { Router } from "react-router-dom";

import { CompareEntry } from "./components/CompareEntry";
import { Generate } from "./components/Generate";
import { NavBar } from "./components/NavBar";

const App = () => (
  <>
    <Router history={createBrowserHistory()}>
      <NavBar />
      <Switch>
        <Redirect from="/" to="/compare" exact />
        <Route path="/compare" component={CompareEntry} exact />
        <Route path="/generate" component={Generate} exact />
        <Route render={() => <h1>404</h1>} />
      </Switch>
    </Router>
  </>
);

export default App;
