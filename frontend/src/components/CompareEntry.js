import React, { useReducer } from "react";

import { CalculateProvider } from "../contexts/CalculateContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { OneHypRef } from "./OneHypRef";
import { Result } from "./Result";
import { Saved } from "./Saved";
import { Settings } from "./Settings";
import { Upload } from "./Upload";

const CompareEntry = () => {
  const [resultKey, reloadResult] = useReducer((oldKey) => !oldKey, true);
  const [savedKey, reloadSaved] = useReducer((oldKey) => !oldKey, true);
  return (
    <div className="uk-container">
      <SettingsProvider>
        <Settings className="uk-margin" />
        <CalculateProvider>
          <OneHypRef className="uk-margin" />
          <Upload className="uk-margin" reloadResult={reloadResult} />
          <Result className="uk-margin" key={resultKey} reloadSaved={reloadSaved} />
        </CalculateProvider>
        <Saved className="uk-margin" key={savedKey} reloadSaved={reloadSaved} />
      </SettingsProvider>
    </div>
  );
};

export { CompareEntry };
