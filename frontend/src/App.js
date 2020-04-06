import React, { useReducer } from "react";
import { NavBar } from "./components/NavBar";
import { Settings } from "./components/Settings";
import { Upload } from "./components/Upload"
import { Result } from "./components/Result"
import { Saved } from "./components/Saved";
import Container from "react-bootstrap/Container";
import { SettingsProvider } from "./contexts/SettingsContext";
import { CalculateProvider } from "./contexts/CalculateContext";

const App = () => {
  const [resultKey, reloadResult] = useReducer(oldKey => !oldKey, true)
  const [savedKey, reloadSaved] = useReducer(oldKey => !oldKey, true)
  return (
    <>
      <NavBar />
      <Container className="mt-3">
        <SettingsProvider>
          <Settings className="mb-3" />
          <CalculateProvider>
            <Upload className="mb-3" reloadResult={reloadResult}/>
            <Result className="mb-3" key={resultKey} reloadSaved={reloadSaved} />
          </CalculateProvider>
          <Saved className="mb-3" key={savedKey} />
        </SettingsProvider>
      </Container>
    </>
  );
};

export default App;
