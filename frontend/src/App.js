import "./css/App.css";

import React, { useReducer, useContext, useEffect, useMemo, useState } from "react";
import {
  FaChevronCircleUp,
  FaCog,
  FaExternalLinkAlt,
  FaGithub,
  FaTwitter,
  FaYoutube,
  FaBars,
} from "react-icons/fa";
import { useLocation } from "react-router";
import { BrowserRouter, NavLink as Link, Navigate, useRoutes } from "react-router-dom";

import { About } from "./components/About";
import { Evaluate } from "./components/Evaluate";
import { Summarize } from "./components/Summarize";
import { Button } from "./components/utils/Button";
import { Card, CardContent, CardHead } from "./components/utils/Card";
import { Container } from "./components/utils/Container";
import { Markup, useMarkupScroll } from "./components/utils/Markup";
import { Modal, ModalTitle, useModal } from "./components/utils/Modal";
import { ButtonGroup, RadioBullet, RadioButton, RadioGroup } from "./components/utils/Radio";
import { HeadingBig, HeadingMedium, HeadingSmall, Hint } from "./components/utils/Text";
import { Toggle } from "./components/utils/Toggle";
import { DragProvider } from "./contexts/DragContext";
import { MetricsProvider } from "./contexts/MetricsContext";
import { SettingsContext, SettingsProvider } from "./contexts/SettingsContext";
import { SummarizersProvider } from "./contexts/SummarizersContext";
import { useMarkup } from "./hooks/markup";
import { ColorMap, colorschemes } from "./utils/color";

const routes = [
  { path: "/summarize", name: "Summarize", element: <Summarize /> },
  { path: "/evaluate", name: "Evaluate", element: <Evaluate /> },
  { path: "/about", name: "About", element: <About /> },
  { path: "*", element: <Navigate to="/summarize" replace /> },
];

const Footer = () => (
  <footer className="min-h-[100px] flex items-center py-2 bg-gray-100 text-xs text-gray-600">
    <Container>
      <div className="flex h-full py-2 gap-2 flex-col md:flex-row justify-between">
        <div className="flex gap-2 items-center justify-center">
          <Button
            appearance="link"
            target="_blank"
            href="https://github.com/webis-de/summary-workbench/issues"
          >
            <div className="flex gap-1 items-center">
              <FaGithub size={20} /> report issues or ask questions
            </div>
          </Button>
        </div>
        <div className="h-full flex flex-col md:flex-row gap-2 items-center justify-center">
          <span>
            &copy; 2022
            <a className="hover:text-gray-600" href="https://webis.de/">
              Webis Group
            </a>
          </span>
          <div className="flex gap-2">
            <span className="hidden md:visible">&bull;</span>
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
        </div>
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
      <a
        href={href}
        className={`flex items-center gap-2 ${className}`}
        target="_blank"
        rel="noreferrer"
      >
        <span>{children}</span>
        <FaExternalLinkAlt style={{ marginTop: -2 }} size={12} />
      </a>
    );
  return (
    <Link to={to} className={({ isActive }) => (isActive ? activeClassName : className)}>
      {children}
    </Link>
  );
};

const NavRoutes = ({ show }) => (
  <div
    className={`${
      show ? "" : "hidden"
    } overflow-hidden md:flex flex gap-4 col-span-2 mb-4 md:mb-0 md:gap-8 uppercase flex-col md:flex-row order-3 md:order-2 items-center`}
  >
    {routes
      .filter(({ name }) => name)
      .map(({ path, name }) => (
        <NavLink key={name} to={path}>
          {name}
        </NavLink>
      ))}
    <NavLink href="https://webis-de.github.io/summary-workbench/">Documentation</NavLink>
  </div>
);

const Navbar = () => {
  const [showBars, toggleBars] = useReducer((v) => !v, false);
  return (
    <>
      <div className="h-16" />
      <nav className="fixed bg-[#1B3451] top-0 right-0 z-30 left-0">
        <Container>
          <div className="grid grid-cols-[1fr_auto] md:flex md:gap-8 md:items-center">
            <a
              href="/"
              className="order-1 min-h-[70px] grow flex items-center text-2xl no-underline text-slate-50 normal-case hover:text-blue-dark font-sans font-bold"
            >
              Summary Workbench
            </a>

            <NavRoutes show={showBars} />
            <div className="order-2 md:order-3 flex items-center justify-end gap-2">
              <NavbarOptions />
              <FaBars
                onClick={toggleBars}
                className={`${
                  showBars ? "rotate-90" : ""
                } md:hidden transition text-gray-400 hover:text-slate-200 cursor-pointer`}
                size={20}
              />
            </div>
          </div>
        </Container>
      </nav>
    </>
  );
};

const previewDoc = `Alan Mathison Turing was an English mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist.
Turing was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the Turing machine, which can be considered a model of a general-purpose computer.
Turing is widely considered to be the father of theoretical computer science and artificial intelligence.
Despite these accomplishments, he was never fully recognised in his home country, if only because much of his work was covered by the Official Secrets Act.
During the Second World War, Turing worked for the Government Code and Cypher School (GC&CS) at Bletchley Park, Britain's codebreaking centre that produced Ultra intelligence.
For a time he led Hut 8, the section that was responsible for German naval cryptanalysis.
English Government much of his work was covered`;

const previewRef = `mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist.
Turing is widely considered to be the father of theoretical computer science and artificial intelligence.
he was never fully recognised in his home country, if only because of the official secrets act.`;

const SettingsContent = ({ close, save }) => {
  const {
    minOverlap,
    ignoreStopwords,
    selfSimilarities,
    colorMap,
    setMinOverlap,
    setIgnoreStopwords,
    setSelfSimilarities,
    setColorMap,
  } = useContext(SettingsContext);

  const {
    markup: [markup1, markup2],
  } = useMarkup(previewDoc, previewRef);

  const scrollState = useMarkupScroll();
  const markupState = useState(null);

  return (
    <div>
      <div className="bg-slate-100 p-5 sticky z-20 top-0 flex flex-wrap justify-between items-center border-b">
        <ModalTitle>Settings</ModalTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Button appearance="soft" variant="primary" onClick={close}>
            Close
          </Button>
          <Button appearance="fill" variant="success" onClick={save}>
            Save and Close
          </Button>
        </div>
      </div>
      <div className="p-5 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:max-w-[400px]">
            <Card full>
              <CardHead>
                <div>
                  <HeadingBig>Highlighting</HeadingBig>
                  <Hint small>
                    Highlighting that is applied to matching word groups (agreement) in the
                    hypothesis and reference
                  </Hint>
                </div>
              </CardHead>
              <CardContent>
                <div>
                  <HeadingMedium>Minimum Word Overlap</HeadingMedium>
                  <Hint small>
                    Matching word groups in the hypothesis and reference with a length less than
                    this value are not shown
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
                  <RadioGroup value={colorMap.colorscheme} setValue={setColorMap}>
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
          <Card full>
            <CardHead>
              <HeadingBig>Preview</HeadingBig>
            </CardHead>
            <CardContent>
              <div className="flex">
                <Markup markups={markup1} markupState={markupState} scrollState={scrollState} />
                <Markup markups={markup2} markupState={markupState} scrollState={scrollState} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Settings = ({ close }) => {
  const [settings, setTmpSettings] = useState(useContext(SettingsContext));
  const {
    minOverlap,
    ignoreStopwords,
    selfSimilarities,
    colorMap,
    setMinOverlap,
    setIgnoreStopwords,
    setSelfSimilarities,
    setColorscheme,
  } = settings;
  const setTmpOption =
    (option, mangle = (v) => v) =>
    (value) =>
      setTmpSettings((old) => ({ ...old, [option]: mangle(value) }));

  const currSetttings = useMemo(
    () => ({
      minOverlap,
      ignoreStopwords,
      selfSimilarities,
      colorMap,
      setMinOverlap: setTmpOption("minOverlap"),
      setIgnoreStopwords: setTmpOption("ignoreStopwords"),
      setSelfSimilarities: setTmpOption("selfSimilarities"),
      setColorMap: setTmpOption("colorMap", (v) => new ColorMap(v, true)),
    }),
    [minOverlap, ignoreStopwords, selfSimilarities, colorMap]
  );

  const save = () => {
    setMinOverlap(minOverlap);
    setIgnoreStopwords(ignoreStopwords);
    setSelfSimilarities(selfSimilarities);
    setColorscheme(colorMap.colorscheme);
    close();
  };

  return (
    <SettingsContext.Provider value={currSetttings}>
      <SettingsContent close={close} save={save} />
    </SettingsContext.Provider>
  );
};

const NavbarOptions = () => {
  const [isOpen, openModal, closeModal] = useModal();

  return (
    <div>
      <FaCog
        size={20}
        onClick={openModal}
        className="text-gray-400 hover:text-slate-200 cursor-pointer"
      />
      <Modal isOpen={isOpen} close={closeModal}>
        <Settings close={closeModal} />
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
      size={40}
      className={`fixed cursor-pointer text-blue-700 bg-white rounded-full z-10 bottom-5 right-4 ${
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
