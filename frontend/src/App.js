import React, { useReducer } from "react";
import Container from "react-bootstrap/Container";

import { NavBar } from "./components/NavBar";
import { OneHypRef } from "./components/OneHypRef";
import { Result } from "./components/Result";
import { Saved } from "./components/Saved";
import { Settings } from "./components/Settings";
import { Upload } from "./components/Upload";
import { CalculateProvider } from "./contexts/CalculateContext";
import { SettingsProvider } from "./contexts/SettingsContext";

const App = () => {
  const [resultKey, reloadResult] = useReducer((oldKey) => !oldKey, true);
  const [savedKey, reloadSaved] = useReducer((oldKey) => !oldKey, true);
  return (
    <>
      <NavBar />
      <Container className="mt-3">
        <SettingsProvider>
          <Settings className="mb-3" />
          <CalculateProvider>
            <OneHypRef className="mb-3" />
            <Upload className="mb-3" reloadResult={reloadResult} />
            <Result
              className="mb-3"
              key={resultKey}
              reloadSaved={reloadSaved}
            />
          </CalculateProvider>
          <Saved className="mb-3" key={savedKey} />
        </SettingsProvider>
      </Container>
    </>
  );
};

export default App;
