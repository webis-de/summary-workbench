import "./css/App.css";

import React, { useContext, useEffect, useState } from "react";
import { FaChevronCircleUp, FaCog, FaGithub, FaTwitter, FaYoutube } from "react-icons/fa";
import { useLocation } from "react-router";
import { BrowserRouter, NavLink as Link, Navigate, useRoutes } from "react-router-dom";

import { About } from "./components/About";
import { Evaluate } from "./components/Evaluate";
import { Summarize } from "./components/Summarize";
import { Button } from "./components/utils/Button";
import { Card, CardContent, CardHead } from "./components/utils/Card";
import { Container } from "./components/utils/Container";
import { Modal, ModalTitle, useModal } from "./components/utils/Modal";
import { ButtonGroup, RadioBullet, RadioButton, RadioGroup } from "./components/utils/Radio";
import { Range } from "./components/utils/Range";
import { HeadingBig, HeadingMedium, HeadingSmall, Hint } from "./components/utils/Text";
import { Toggle } from "./components/utils/Toggle";
import { DragProvider } from "./contexts/DragContext";
import { MetricsProvider } from "./contexts/MetricsContext";
import { SettingsContext, SettingsProvider } from "./contexts/SettingsContext";
import { SummarizersProvider } from "./contexts/SummarizersContext";
import { colorschemes } from "./utils/color";

const routes = [
  { path: "/summarize", name: "Summarize", element: <Summarize /> },
  { path: "/evaluate", name: "Evaluate", element: <Evaluate /> },
  { path: "/about", name: "About", element: <About /> },
  { path: "*", element: <Navigate to="/summarize" replace /> },
];

const Footer = () => (
  <footer className="h-32 w-full bg-gray-100 text-xs text-gray-600">
    <Container>
      <div className="h-full flex gap-2 items-center justify-end">
        <span>
          &copy; 2022{" "}
          <a className="hover:text-gray-600" href="https://webis.de/">
            Webis Group
          </a>
        </span>
        <span>&bull;</span>
        <a href="https://github.com/webis-de">
          <FaGithub className="text-base text-gray-400 hover:text-gray-400" />
        </a>
        <a href="https://twitter.com/webis_de">
          <FaTwitter className="text-base text-gray-400 hover:text-gray-400" />
        </a>
        <a href="https://www.youtube.com/webis">
          <FaYoutube className="text-base text-gray-400 hover:text-gray-400" />
        </a>
        <span>&bull;</span>
        <a className="hover:text-gray-600" href="https://webis.de/people.html">
          Contact
        </a>
        <span>&bull;</span>
        <a className="hover:text-gray-600" href="https://webis.de/legal.html">
          Impressum / Terms / Privacy
        </a>
      </div>
    </Container>
  </footer>
);

const NavLink = ({ href, to, children }) => {
  const classNameBase = "uppercase text-sm";
  const className = `text-gray-400 font-medium hover:text-slate-200 hover:no-underline ${classNameBase}`;
  const activeClassName = `text-gray-100 font-medium hover:text-gray-100 underline underline-offset-4 ${classNameBase}`;
  if (href)
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  return (
    <Link to={to} className={({ isActive }) => (isActive ? activeClassName : className)}>
      {children}
    </Link>
  );
};

const NavRoutes = () => (
  <div className="ml-10 flex gap-8 uppercase">
    {routes
      .filter(({ name }) => name)
      .map(({ path, name }) => (
        <NavLink key={name} to={path}>
          {name}
        </NavLink>
      ))}
  </div>
);

const Navbar = () => (
  <>
    <div className="h-16" />
    <nav className="fixed bg-[#1B3451] top-0 right-0 z-30 left-0">
      <Container>
        <div className="h-16 flex justify-between items-center">
          <NavLink href="https://webis.de/">
            {/* <div className="flex items-center">
              <img src="https://assets.webis.de/img/webis-logo.png" alt="Webis Logo" />
              <span className="ml-4">Webis.de</span>
            </div> */}
            <span className="text-2xl no-underline text-slate-50 normal-case hover:text-blue-dark font-sans font-bold">
              Summary Workbench
            </span>
          </NavLink>

          <div className="flex gap-10">
            <NavRoutes />
            <NavbarOptions />
          </div>
        </div>
      </Container>
    </nav>
  </>
);

const NavbarOptions = () => {
  const [isOpen, openModal, closeModal] = useModal();

  const {
    minOverlap,
    setMinOverlap,
    ignoreStopwords,
    setIgnoreStopwords,
    selfSimilarities,
    setSelfSimilarities,
    colorMap,
    setColorscheme,
    summaryLength,
    setSummaryLength,
  } = useContext(SettingsContext);

  return (
    <div>
      <FaCog
        onClick={openModal}
        className="text-gray-400 hover:text-slate-200 cursor-pointer w-5 h-5"
      />
      <Modal isOpen={isOpen} close={closeModal}>
        <div className="bg-slate-100 p-5 sticky z-20 top-0 flex justify-between items-center border-b">
          <ModalTitle>Settings</ModalTitle>
          <Button appearance="soft" onClick={closeModal}>
            Close
          </Button>
        </div>
        <div className="p-5 space-y-6">
          <Card full>
            <CardHead>
              <div>
                <HeadingBig>Summarization</HeadingBig>
                <Hint small>Customize the Summarization</Hint>
              </div>
            </CardHead>
            <CardContent>
              <div>
                <HeadingMedium>Summary length</HeadingMedium>
                <Hint small>Length of the summary in percent</Hint>
                <Range defaultValue={summaryLength} setValue={setSummaryLength} min={5} max={50} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHead>
              <div>
                <HeadingBig>Highlighting</HeadingBig>
                <Hint small>
                  Highlighting that is applied to matching word groups (agreement) in the hypothesis
                  and reference
                </Hint>
              </div>
            </CardHead>
            <CardContent>
              <div>
                <HeadingMedium>Minimum Word Overlap</HeadingMedium>
                <Hint small>
                  Matching word groups in the hypothesis and reference with a length less than this
                  value are not shown
                </Hint>
                <RadioGroup value={minOverlap} setValue={setMinOverlap}>
                  <div className="flex justify-evenly m-1 flex-wrap">
                    {[1, 2, 3, 5, 7, 10].map((value) => (
                      <RadioBullet key={value} value={value}>
                        {value}
                      </RadioBullet>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              <div>
                <HeadingMedium>Show Redundancy</HeadingMedium>
                <div className="flex justify-between items-top">
                  <Hint small>
                    Show also the matching word groups within the reference or hypothesis
                  </Hint>
                  <Toggle checked={selfSimilarities} onChange={setSelfSimilarities} />
                </div>
              </div>
              <div>
                <HeadingMedium>Ignore Stopwords</HeadingMedium>
                <div className="flex justify-between items-top">
                  <Hint small>{"Don't consider stopwords part of the match"}</Hint>
                  <Toggle checked={ignoreStopwords} onChange={setIgnoreStopwords} />
                </div>
              </div>
              <div>
                <HeadingMedium>Colorscheme</HeadingMedium>
                <Hint small>Color palette used to highlight matching</Hint>
                <RadioGroup value={colorMap.colorscheme} setValue={setColorscheme}>
                  <div className="pt-2 grid grid-cols-2 justify-items-center gap-4">
                    {Object.keys(colorschemes).map((category) => (
                      <HeadingSmall key={category}>{category}</HeadingSmall>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(colorschemes).map(([category, names]) => (
                      <ButtonGroup key={category}>
                        {names.map((name) => (
                          <RadioButton value={name} key={name}>
                            {name}
                          </RadioButton>
                        ))}
                      </ButtonGroup>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>
      </Modal>
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
      className={`fixed cursor-pointer text-blue-700 bg-white rounded-full w-9 h-9 z-10 bottom-5 right-4 ${
        visible ? "block" : "hidden"
      }`}
      title="scoll to top"
      onClick={scrollToTop}
    />
  );
};

const Content = () => {
  const element = useRoutes(routes);
  return (
    <>
      <ScrollToTopButton />
      <main className="pt-7 pb-7 flex-grow">
        <Container>{element}</Container>
      </main>
    </>
  );
};

const ScrollRouterTop = ({ children }) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return children;
};

const Router = ({ children }) => (
  <BrowserRouter>
    <ScrollRouterTop>{children}</ScrollRouterTop>
  </BrowserRouter>
);

const App = () => (
  <DragProvider>
    <MetricsProvider>
      <SummarizersProvider>
        <SettingsProvider>
          <Router>
            <div className="min-h-screen flex flex-col overflow-hidden">
              <Navbar />
              <Content />
              <Footer />
            </div>
          </Router>
        </SettingsProvider>
      </SummarizersProvider>
    </MetricsProvider>
  </DragProvider>
);

export default App;
