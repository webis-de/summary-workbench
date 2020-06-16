import React from "react";
import { Link } from "react-router-dom";
import { Container, Navbar } from "uikit-react";

const NavBar = () => (
  <nav className="uk-navbar uk-navbar-container uk-margin">
    <div className="uk-navbar-left">
      <div className="uk-navbar-item uk-logo uk-link-muted">
        <Link to={{ pathname: "/" }} style={{ textDecoration: "none" }}>
          CompareFile
        </Link>
      </div>
      <ul className="uk-navbar-nav">
        <li>
          <Link to={{ pathname: "/compare" }}>Compare</Link>
        </li>
        <li>
          <Link to={{ pathname: "/summarize" }}>Summarize</Link>
        </li>
      </ul>
    </div>
    <div className="uk-navbar-right">
      <ul className="uk-navbar-nav">
        <li>
          <Link className="ml-auto" to={{ pathname: "/about" }}>
            About
          </Link>
        </li>
      </ul>
    </div>
  </nav>
);

export { NavBar };
