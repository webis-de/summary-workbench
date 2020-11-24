import React, { useEffect, useReducer, useRef, useState } from "react";

import { CalculateProvider } from "../contexts/CalculateContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { OneHypRef } from "./OneHypRef";
import { Result } from "./Result";
import { Saved } from "./Saved";
import { Settings } from "./Settings";
import { Upload } from "./Upload";

const Evaluate = () => {
  const [resultKey, reloadResult] = useReducer((oldKey) => !oldKey, true);
  const [savedKey, reloadSaved] = useReducer((oldKey) => !oldKey, true);
  const [calculateResult, setCalculateResult] = useState(null);
  const [vis, toggleVis] = useReducer((e) => !e, true);

  const resultRef = useRef(null);

  useEffect(() => {
    if (calculateResult !== null) {
      resultRef.current.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [calculateResult, resultRef]);

  return (
    <div className="uk-container uk-container-expand uk-margin-medium-top uk-margin-large-top@l ">
      <SettingsProvider>
        <div />
        <div className="uk-flex uk-flex-between">
          <div style={{ flexBasis: "60%" }}>
            <Upload className="uk-margin" setCalculateResult={setCalculateResult} />
            <OneHypRef className="uk-margin" />
          </div>
          <div style={{ flexBasis: "37%" }}>
            <Settings className="uk-margin" />
          </div>
        </div>
        <div ref={resultRef} style={{ scrollMarginTop: "80px" }} className="uk-margin-large-top" />
        <Result
          className="uk-margin"
          calculateResult={calculateResult}
          setCalculateResult={setCalculateResult}
          reloadSaved={reloadSaved}
        />
        <Saved className="uk-margin" key={savedKey} reloadSaved={reloadSaved} />
      </SettingsProvider>
    </div>
  );
};

export { Evaluate };
