import "./css/App.css";

import { Dialog, RadioGroup as Radio, Switch } from "@headlessui/react";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { FaChevronCircleUp, FaCog, FaGithub, FaTwitter, FaYoutube } from "react-icons/fa";
import { Range as ReactRange, getTrackBackground } from "react-range";
import { NavLink as Link, Navigate, BrowserRouter as Router, useRoutes } from "react-router-dom";

import { About } from "./components/About";
import { Evaluate } from "./components/Evaluate";
import { Summarize } from "./components/Summarize";
import { VisualizationView } from "./components/Visualize";
import { MetricsProvider } from "./contexts/MetricsContext";
import { SettingsContext, SettingsProvider } from "./contexts/SettingsContext";
import { SummarizersProvider } from "./contexts/SummarizersContext";
import { colorschemes } from "./utils/color";

const buttonStyles = {
  "*": "px-4 py-2 rounded-md text-sm font-medium font-bold tracking-tight",
  fill: {
    "*": "border-0 focus:outline-none focus:ring transition text-white",
    primary: "bg-blue-600 hover:bg-blue-800 active:bg-blue-800 focus:ring-blue-300",
    secondary: "bg-gray-600 hover:bg-gray-800 active:bg-gray-800 focus:ring-gray-300",
    success: "bg-green-600 hover:bg-green-800 active:bg-green-800 focus:ring-green-300",
    warning: "bg-yellow-600 hover:bg-yellow-800 active:bg-yellow-800 focus:ring-yellow-300",
    danger: "bg-red-600 hover:bg-red-800 active:bg-red-800 focus:ring-red-300",
  },
  outline: {
    "*": "border focus:outline-none focus:ring transition",
    primary:
      "text-blue-600 border-blue-600 hover:text-white hover:bg-blue-600 active:bg-blue-800 focus:ring-blue-300",
    secondary:
      "text-gray-600 border-gray-600 hover:text-white hover:bg-gray-600 active:bg-gray-800 focus:ring-gray-300",
    success:
      "text-green-600 border-green-600 hover:text-white hover:bg-green-600 active:bg-green-800 focus:ring-green-300",
    warning:
      "text-yellow-600 border-yellow-600 hover:text-white hover:bg-yellow-600 active:bg-yellow-800 focus:ring-yellow-300",
    danger:
      "text-red-600 border-red-600 hover:text-white hover:bg-red-600 active:bg-red-800 focus:ring-red-300",
  },
  soft: {
    "*": "border shadow focus:outline-none focus:ring transition",
    primary:
      "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 active:bg-blue-200 focus:ring-blue-300",
    secondary:
      "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300",
    success:
      "text-green-600 bg-green-50 border-green-200 hover:bg-green-100 active:bg-green-200 focus:ring-green-300",
    warning:
      "text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 active:bg-yellow-200 focus:ring-yellow-300",
    danger:
      "text-red-600 bg-red-50 border-red-200 hover:bg-red-100 active:bg-red-200 focus:ring-red-300",
  },
  room: {
    "*": "border-b-2 focus:outline-none focus:ring transition text-white",
    primary: "bg-blue-600 border-blue-900 hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-300",
    secondary:
      "bg-gray-600 border-gray-900 hover:bg-gray-700 active:bg-gray-800 focus:ring-gray-300",
    success:
      "bg-green-600 border-green-900 hover:bg-green-700 active:bg-green-800 focus:ring-green-300",
    warning:
      "bg-yellow-600 border-yellow-900 hover:bg-yellow-700 active:bg-yellow-800 focus:ring-yellow-300",
    danger: "bg-red-600 border-red-900 hover:bg-red-700 active:bg-red-800 focus:ring-red-300",
  },
  disabled: {
    "*": "cursor-default text-sm font-medium text-white",
    primary: "bg-blue-300",
    secondary: "bg-gray-300",
    success: "bg-green-300",
    warning: "bg-yellow-300",
    danger: "bg-red-300",
  },
};

const Button = ({ appearence = "fill", variant = "primary", children, onClick, disabled }) => {
  const a = disabled ? "disabled" : appearence;
  const className = `${buttonStyles["*"]} ${buttonStyles[a]["*"]} ${buttonStyles[a][variant]}`;
  return <button className={className} disabled={a === "disabled"} onClick={onClick}>{children}</button>;
};

const routes = [
  { path: "/summarize", name: "Summarize", element: <Summarize /> },
  { path: "/evaluate", name: "Evaluate", element: <Evaluate /> },
  { path: "/visualize", name: "Visualize", element: <VisualizationView /> },
  { path: "/about", name: "About", element: <About /> },
  { path: "*", element: <Navigate to="/summarize" replace /> },
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

const NavLink = ({ href, to, children }) => {
  const classNameBase = "uppercase text-sm";
  const className = `text-gray-400 hover:text-slate-200 hover:no-underline ${classNameBase}`;
  const activeClassName = `text-gray-100 hover:text-gray-100 underline underline-offset-4 ${classNameBase}`;
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
    <nav className="fixed top-0 right-0 left-0 bg-neutral-700">
      <div className="container mx-auto px-8 h-16 flex justify-between items-center">
        <NavLink href="https://webis.de/">
          <div className="flex items-center">
            <img src="https://assets.webis.de/img/webis-logo.png" alt="Webis Logo" />
            <span className="ml-4">Webis.de</span>
          </div>
        </NavLink>
        <div className="flex gap-10">
          <NavRoutes />
          <NavbarOptions />
        </div>
      </div>
    </nav>
  </>
);

const HeadingSmall = ({ children }) => (
  <h5 className="text-bold capitalize text-slate-600 text-sm font-semibold">{children}</h5>
);

const HeadingMedium = ({ children }) => (
  <h4 className="text-bold capitalize text-slate-600 font-semibold">{children}</h4>
);

const HeadingBig = ({ children }) => (
  <h3 className="text-2xl capitalize font-semibold text-gray-900 dark:text-white">{children}</h3>
);

const Toggle = ({ enabled, setEnabled }) => (
  <Switch
    checked={enabled}
    onChange={setEnabled}
    className={`${
      enabled ? "bg-blue-600" : "bg-gray-200"
    } relative inline-flex flex-shrink-0 h-[24px] w-[46px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
  >
    <span className="sr-only">Use setting</span>
    <span
      aria-hidden="true"
      className={`${
        enabled ? "translate-x-[22px]" : ""
      } pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
    />
  </Switch>
);
const Card = ({ children, className = "max-w-sm" }) => (
  <div
    className={`${className} maw-w-sm divide-y bg-white rounded-lg border border-gray-200 shadow-md`}
  >
    {children}
  </div>
);

const CardHead = ({ children }) => <div className="p-6 pb-4">{children}</div>;

const CardContent = ({ children }) => <div className="p-6 space-y-10">{children}</div>;

const CardFoot = ({ children }) => <div className="p-6">{children}</div>;

const RadioOption = ({ value, children }) => (
  <Radio.Option value={value}>
    {({ checked }) => (
      <label className="flex items-center whitespace-nowrap">
        <input
          type="radio"
          className="form-radio w-4 h-4 rounded-2 border-gray-300 bg-gray-100 focus:ring-2 focus:ring-blue-300"
          checked={checked}
        />
        <span className="ml-2 text-gray-700">{children}</span>
      </label>
    )}
  </Radio.Option>
);

const RadioButton = ({ value, grouped, children }) => (
  <Radio.Option
    value={value}
    as="button"
    className={({ checked }) => `${
      checked
        ? "bg-gray-700 text-white ring-gray-500 z-10 ring-2"
        : "text-gray-900 bg-white hover:text-white hover:bg-gray-500"
    } py-2 px-4 text-sm font-medium border-gray-900
    ${grouped ? "first:rounded-t-lg last:rounded-b-lg border-x border-t last:border-b " : "border"}
    `}
  >
    {children}
  </Radio.Option>
);
const RadioGroup = ({ value, setValue, children }) => (
  <Radio value={value} onChange={setValue}>
    {children}
  </Radio>
);

const Hint = ({ children }) => <span className="block text-sm text-gray-500">{children}</span>;

const ButtonGroup = ({ children }) => (
  <div className="flex flex-col rounded-md shadow-sm" role="group">
    {children.map((child) =>
      React.cloneElement(child, {
        grouped: true,
      })
    )}
  </div>
);

const Range = ({ defaultValue, setValue, min = 0, max = 100 }) => {
  const [values, setValues] = React.useState([parseInt(defaultValue, 10)]);
  return (
    <div className="h-10 mt-10 max-w-lg flex items-center flex-wrap">
      <ReactRange
        values={values}
        step={1}
        min={min}
        max={max}
        onChange={(v) => setValues(v)}
        onFinalChange={([v]) => setValue(v)}
        renderTrack={({ props, children }) => (
          <div
            className="rounded-full h-2 w-full"
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
            }}
          >
            <div
              className="h-2 w-full rounded-full self-center"
              ref={props.ref}
              style={{
                background: getTrackBackground({
                  values,
                  colors: ["#548bf4", "#d1d5db"],
                  min,
                  max,
                }),
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            className="w-9 h-9 flex justify-center items-center rounded-full bg-white ring-2 ring-gray-500 shadow-gray-700"
            {...props}
            style={{
              ...props.style,
            }}
          >
            <div className="whitespace-nowrap tracking-tighter absolute p-1 rounded-md -top-9 text-white font-bold text-sm bg-blue-500">
              {`${values[0].toFixed(0)} %`}
            </div>
            <div className={"h-2 w-6 rounded-sm bg-blue-500"} />
          </div>
        )}
      />
    </div>
  );
};

const NavbarOptions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    minOverlap,
    ignoreStopwords,
    toggleIgnoreStopwords,
    setMinOverlap,
    allowSelfSimilarities,
    toggleAllowSelfSimilarities,
    colorMap,
    setColorMap,
    summaryLength,
    setSummaryLength,
  } = useContext(SettingsContext);
  return (
    <>
      <FaCog
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-slate-200 cursor-pointer"
        style={{ minWidth: "20px" }}
      />
      <Dialog
        className="fixed bg-white shadow-xl shadow-stone-400 z-100 border inset-x-12 inset-y-6 overflow-y-auto bg-slate"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <Dialog.Overlay />
        <div>
          <div className="bg-white p-5 sticky z-20 top-0 flex justify-between items-center border-b">
            <Dialog.Title className="text-3xl font-bold">Settings</Dialog.Title>
            <Button appearence="soft" onClick={() => setIsOpen(false)}>Close</Button>
          </div>
          <div className="p-5 space-y-6">
            <Card className="w-full">
              <CardHead>
                <HeadingBig>Summarization</HeadingBig>
                <Hint>Customize the Summarization</Hint>
              </CardHead>
              <CardContent>
                <div>
                  <HeadingMedium>Summary length</HeadingMedium>
                  <Hint>Length of the summary in percent</Hint>
                  <Range
                    defaultValue={summaryLength}
                    setValue={setSummaryLength}
                    min={5}
                    max={50}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHead>
                <HeadingBig>Highlighting</HeadingBig>
                <Hint>
                  Highlighting that is applied to matching word groups (agreement) in the hypothesis
                  and reference
                </Hint>
              </CardHead>
              <CardContent>
                <div>
                  <HeadingMedium>Minimum Word Overlap</HeadingMedium>
                  <Hint>
                    Matching word groups in the hypothesis and reference with a length less than
                    this value are not shown
                  </Hint>
                  <RadioGroup value={minOverlap} setValue={setMinOverlap}>
                    <div className="flex justify-evenly m-1 flex-wrap">
                      {[1, 2, 3, 5, 7, 10].map((value) => (
                        <RadioOption key={value} value={value}>
                          {value}
                        </RadioOption>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <HeadingMedium>Show Redundancy</HeadingMedium>
                  <div className="flex justify-between items-top">
                    <Hint>
                      Show also the matching word groups within the reference or hypothesis
                    </Hint>
                    <Toggle
                      enabled={allowSelfSimilarities}
                      setEnabled={toggleAllowSelfSimilarities}
                    />
                  </div>
                </div>
                <div>
                  <HeadingMedium>Ignore Stopwords</HeadingMedium>
                  <div className="flex justify-between items-top">
                    <Hint>{"Don't consider stopwords part of the match"}</Hint>
                    <Toggle enabled={ignoreStopwords} setEnabled={toggleIgnoreStopwords} />
                  </div>
                </div>
                <div>
                  <HeadingMedium>Colorscheme</HeadingMedium>
                  <Hint>Color palette used to highlight matching</Hint>
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
        </div>
      </Dialog>
    </>
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
        backgroundColor: "#fff",
        borderRadius: "100%",
      }}
      onClick={scrollToTop}
    />
  );
};

const Content = () => {
  const element = useRoutes(routes);
  return (
    <>
      <ScrollToTopButton />
      <main className="uk-section uk-section-default">
        <div className="uk-container uk-container-expand">{element}</div>
      </main>
    </>
  );
};

const App = () => (
  <MetricsProvider>
    <SummarizersProvider>
      <SettingsProvider>
        <Router>
          <Navbar />
          <Content />
          <Footer />
        </Router>
      </SettingsProvider>
    </SummarizersProvider>
  </MetricsProvider>
);

export default App;
