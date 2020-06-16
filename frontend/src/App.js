import { createBrowserHistory } from "history";
import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { Router } from "react-router-dom";

import { CompareEntry } from "./components/CompareEntry";
import { Summarize } from "./components/Summarize";
import { NavBar } from "./components/NavBar";
import { About } from "./components/About";

const App = () => (
  <>
    <Router history={createBrowserHistory()}>
      <NavBar />
      <Switch>
        <Redirect from="/" to="/compare" exact />
        <Route path="/compare" component={CompareEntry} exact />
        <Route path="/summarize" component={Summarize} exact />
        <Route path="/about" component={About} exact />
        <Route render={() => <h1>404</h1>} />
      </Switch>
    </Router>
    <div className="uk-margin-large-bottom" />
  </>
);

export default App;
