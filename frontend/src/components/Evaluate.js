import React, { useReducer } from "react";

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
  return (
    <div className="uk-container uk-container-expand uk-margin-large-top">
      <SettingsProvider>
        <CalculateProvider>
        <div className="uk-flex uk-flex-between">
            <div style={{flexBasis:"60%"}}>
            <Upload className="uk-margin" reloadResult={reloadResult} />
            <OneHypRef className="uk-margin" />
            </div>
            <div style={{flexBasis:"37%"}}>
            <Settings className="uk-margin" />
            </div>
          </div>
          <div className="uk-margin-large-top">
              <Result className="uk-margin" key={resultKey} reloadSaved={reloadSaved} />
            </div>
          </CalculateProvider>
        <Saved className="uk-margin" key={savedKey} reloadSaved={reloadSaved} />
      </SettingsProvider>
    </div>
  );
};

export { Evaluate };
