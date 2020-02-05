import React from "react";
import NavBar from "./components/NavBar";
import Settings from "./components/Settings";
import Saved from "./components/Saved";
import Container from "react-bootstrap/Container";
import Calculation from "./components/Calculation"

const App = () => {
  return (
    <>
      <NavBar />
      <Container className="mt-3">
        <Settings className="mb-3" />
        <Calculation className="mb-3" />
        <Saved className="mb-3" />
      </Container>
    </>
  );
};

export default App;
