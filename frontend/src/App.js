import React from "react";
import NavBar from './components/NavBar.js'
import Settings from './components/Settings.js'

function App() {
  return (
    <>
      <NavBar />
      <div class="Container">
        <h1 class="page-header">compfile</h1>
        <Settings />
      </div>
    </>
  );
};

export default App;
