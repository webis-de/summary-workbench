import React, { Fragment, useContext, useEffect, useState } from "react";
import { FaChevronCircleUp, FaCog, FaGithub, FaTwitter, FaYoutube } from "react-icons/fa";
import { Link, Redirect, Route, Router, Switch, useLocation } from "react-router-dom";

import { About } from "./components/About";
import { Evaluate } from "./components/Evaluate";
import { Summarize } from "./components/Summarize";
import { Button } from "./components/utils/Button";
import { VisualizationOverview } from "./components/Visualize";
import { MetricsProvider } from "./contexts/MetricsContext";
import { SettingsContext, SettingsProvider } from "./contexts/SettingsContext";
import { SummarizersProvider } from "./contexts/SummarizersContext";
import history from "./history";
import { colorschemes } from "./utils/color";

const routes = [
  ["/summarize", "Summarize", Summarize],
  ["/evaluate", "Evaluate", Evaluate],
  ["/visualize", "Visualize", VisualizationOverview],
  ["/about", "About", About],
];

const Footer = () => (
  <>
    <div style={{ marginBottom: "143px" }} />
    <footer
      className="uk-section uk-section-muted footer-section"
      style={{ paddingBottom: "30px", position: "absolute", left: 0, bottom: 0, right: 0 }}
    >
      <div className="uk-container">
        <div className="uk-grid uk-grid-small uk-margin-top">
          <div className="uk-width-expand uk-visible@s" />
          <div>
            &copy; 2021 <a href="https://webis.de/">Webis Group</a>{" "}
            <span className="uk-padding-small">&bull;</span>
            <a href="https://github.com/webis-de" style={{ paddingRight: "5px" }}>
              <FaGithub style={{ width: "15px" }} />
            </a>
            <a href="https://twitter.com/webis_de" style={{ paddingRight: "5px" }}>
              <FaTwitter style={{ width: "15px" }} />
            </a>
            <a href="https://www.youtube.com/webis">
              <FaYoutube style={{ width: "15px" }} />
            </a>
            <span className="uk-padding-small">&bull;</span>
            <a href="https://webis.de/people.html">Contact</a>{" "}
            <span className="uk-padding-small">&bull;</span>
            <a href="https://webis.de/legal.html">Impressum / Terms / Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  </>
);

const NavbarLogo = () => (
  <ul className="uk-navbar-nav">
    <li>
      <a href="https://webis.de/">
        <img
          src="https://assets.webis.de/img/webis-logo.png"
          alt="Webis Logo"
          className="uk-logo"
        />
        <span style={{ marginLeft: "10px" }}>Webis.de</span>
      </a>
    </li>
  </ul>
);

const NavbarRight = ({ children }) => <div className="uk-navbar-right uk-light">{children}</div>;
const NavbarLeft = ({ children }) => <div className="uk-navbar-left uk-light">{children}</div>;
const NavbarContent = () => {
  const location = useLocation();
  return (
    <ul className="uk-navbar-nav">
      {routes.map(([path, readable]) => (
        <li key={path} className={path === location.pathname ? "uk-active" : null}>
          <Link to={path}>{readable}</Link>
        </li>
      ))}
    </ul>
  );
};

const WebisPath = () => (
  <nav className="uk-container">
    <ul className="uk-breadcrumb">
      <li>
        <a href="https://webis.de">Webis.de</a>
      </li>
      <li>
        <a href="https://webis.de/research.html">Research</a>
      </li>
      <li>
        <a href="https://webis.de/research/tldr.html">TL;DR</a>
      </li>
      <li className="uk-disabled">
        <a href="/#">Summarizer</a>
      </li>
    </ul>
  </nav>
);

const Navbar = () => (
  <>
    <div className="uk-background-secondary global-nav uk-flex" data-uk-sticky>
      <nav
        className="uk-navbar-container uk-navbar-transparent uk-container "
        data-uk-navbar="mode: click"
        style={{ flex: "1 0" }}
      >
        <NavbarLeft>
          <NavbarLogo />
        </NavbarLeft>
        <NavbarRight>
          <NavbarContent />
        </NavbarRight>
        <NavbarOptions />
      </nav>
    </div>
    <WebisPath />
  </>
);

const IndentStyle = ({ children }) => (
  <div className="uk-flex">
    <div style={{ width: "20px" }} />
    <div>{children}</div>
  </div>
);

const ColorschemeSetting = ({ colorMap, setColorMap }) => (
  <div className="uk-margin">
    <h4>Colorscheme</h4>
    <IndentStyle>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gridGap: "10px" }}>
        {Object.entries(colorschemes).map(([category, names]) => (
          <Fragment key={category}>
            <span>{category}</span>
            <div style={{ display: "inline-flex", width: "400px" }}>
              {names.map((name) => (
                <Button
                  key={name}
                  size="small"
                  onClick={() => setColorMap(name)}
                  variant={name === colorMap.colorscheme ? "primary" : "default"}
                >
                  {name}
                </Button>
              ))}
            </div>
          </Fragment>
        ))}
      </div>
    </IndentStyle>
  </div>
);

const NavbarOptions = () => {
  const {
    minOverlap,
    setMinOverlap,
    allowSelfSimilarities,
    toggleAllowSelfSimilarities,
    colorMap,
    setColorMap,
    summaryLength,
    setSummaryLength,
  } = useContext(SettingsContext);
  return (
    <div className="uk-flex uk-flex-center" style={{ marginLeft: "30px" }}>
      <FaCog className="hover-gray" style={{ minWidth: "20px" }} />
      <div uk-dropdown="mode: click; pos: bottom-left">
        <h3>Highlighting</h3>
        <IndentStyle>
          <ColorschemeSetting colorMap={colorMap} setColorMap={setColorMap} />
          <div className="uk-flex uk-flex-middle uk-margin">
            <h4 style={{ margin: "0", marginRight: "20px" }}>Minimum Word Overlap</h4>
            <div className="margin-between-20" style={{ display: "inline-block" }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num} style={{ whiteSpace: "nowrap" }}>
                  {num}
                  <input
                    type="radio"
                    value={num}
                    checked={num === minOverlap}
                    onChange={(e) => setMinOverlap(e.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="uk-flex uk-flex-middle">
            <h4 style={{ margin: "0", marginRight: "20px" }}>Show Redundancy</h4>
            <input
              style={{ margin: "0" }}
              className="uk-checkbox"
              checked={allowSelfSimilarities}
              readOnly
              onClick={toggleAllowSelfSimilarities}
              type="checkbox"
            />
          </div>
        </IndentStyle>
        <h3>Summarization</h3>
        <IndentStyle>
          <div className="uk-flex uk-flex-row" style={{ alignItems: "center" }}>
            <h4 style={{ margin: 0 }}>Summary Length</h4>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              defaultValue={summaryLength}
              style={{
                flex: "1 0",
                minWidth: "100px",
                marginLeft: "15px",
                marginRight: "15px",
              }}
              onChange={(e) => setSummaryLength(e.currentTarget.value)}
            />
            <span
              className="uk-flex uk-label"
              style={{
                alignItems: "center",
                justifyContent: "right",
                width: "30px",
                height: "30px",
              }}
            >
              {`${summaryLength}%`}
            </span>
          </div>
        </IndentStyle>
      </div>
    </div>
  );
};

const ScrollToTopButton = () => {
  const getVisibleState = () => document.documentElement.scrollTop > 300;
  const [visible, setVisible] = useState(getVisibleState);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const listener = () => setVisible(getVisibleState());
    window.addEventListener("scroll", listener);
    return () => window.removeEventListener("scoll", listener);
  }, [setVisible]);

  return (
    <FaChevronCircleUp
      title="scoll to top"
      style={{
        cursor: "pointer",
        position: "fixed",
        display: visible ? "block" : "none",
        zIndex: 99,
        bottom: "20px",
        right: "15px",
        width: "38px",
        color: "#000",
      }}
      onClick={scrollToTop}
    />
  );
};

const Content = () => {
  const location = useLocation();
  return (
    <>
      <ScrollToTopButton />
      <main className="uk-section uk-section-default">
        <div className="uk-container uk-container-expand">
          <Switch>
            {routes.map(([path, , component]) => (
              <Route key={location.key} path={path} component={component} />
            ))}
            <Redirect to={routes[0][0]} />
          </Switch>
        </div>
      </main>
    </>
  );
};

const App = () => (
  <MetricsProvider>
    <SummarizersProvider>
      <SettingsProvider>
        <Router history={history}>
          <Navbar />
          <Content />
          <Footer />
        </Router>
      </SettingsProvider>
    </SummarizersProvider>
  </MetricsProvider>
);

export default App;
