import React, { useEffect, useReducer, useRef, useState } from "react";

import { SettingsProvider } from "../contexts/SettingsContext";
//import { OneHypRef } from "./OneHypRef";
import { Result } from "./Result";
import { Saved } from "./Saved";
import { Settings } from "./Settings";
import { Upload } from "./Upload";

const Evaluate = () => {
  const [savedKey, reloadSaved] = useReducer((oldKey) => !oldKey, true);
  const [calculateResult, setCalculateResult] = useState(null);
  const [rerender, toggleRerender] = useReducer((v) => !v, false)

  useEffect(() => toggleRerender(), [calculateResult])

  const resultRef = useRef(null);

  return (
    <div className="uk-container uk-container-expand uk-margin-medium-top uk-margin-large-top@l ">
      <SettingsProvider>
        <div />
        <div className="uk-flex uk-flex-between">
          <div style={{ flexBasis: "60%" }}>
            <Upload className="uk-margin" setCalculateResult={setCalculateResult} />
            {/*<OneHypRef className="uk-margin" />*/}
          </div>
          <div style={{ flexBasis: "37%" }}>
            <Settings className="uk-margin" />
          </div>
        </div>
        <div ref={resultRef} style={{ scrollMarginTop: "80px" }} className="uk-margin-large-top" />
        <Result
          key={rerender}
          resultRef={resultRef}
          className="uk-margin"
          calculateResult={calculateResult}
          setCalculateResult={setCalculateResult}
          reloadSaved={reloadSaved}
        />
        <Saved className="uk-margin" key={savedKey +2} reloadSaved={reloadSaved} />
      </SettingsProvider>
    </div>
  );
};

export { Evaluate };
