import React from "react";
import NavBar from "./components/NavBar";
import Settings from "./components/Settings";
import Upload from "./components/Upload";
import Saved from "./components/Saved";
import Result from "./components/Result";
import Container from "react-bootstrap/Container";

function App() {
  const computeOnClick = (hypfile, reffile) => {
    alert(hypfile + reffile);
  };
  return (
    <>
      <NavBar />
      <Container className="mt-3">
        <Settings className="mb-3" />
        <Upload className="mb-3" computeOnClick={computeOnClick} />
        <Result className="mb-3" />
        <Saved className="mb-3" />
      </Container>
    </>
  );
}

export default App;
