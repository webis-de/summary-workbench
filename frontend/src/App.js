import React, { Component } from "react";
import NavBar from "./components/NavBar";
import Settings from "./components/Settings";
import Upload from "./components/Upload";
import Saved from "./components/Saved";
import Result from "./components/Result";
import Container from "react-bootstrap/Container";

class App extends Component {
  constructor(props) {
    super(props);
    this.hypfilename = null;
    this.reffilename = null;
    this.resultRef = React.createRef();
  }
  setHypfilename = filename => {
    this.hypfilename = filename;
  };
  setReffilename = filename => {
    this.reffilename = filename;
  };
  computeOnClick = () => {
    if (this.hypfilename && this.reffilename) {
      const method = "PUT";
      const body = JSON.stringify({
        hypname: this.hypfilename,
        refname: this.reffilename
      });
      fetch("http://localhost:5000/api/calculation", {
        method,
        body,
        headers: { "Content-Type": "application/json" }
      });
      this.setState({});
    } else {
      alert("choose file");
    }
  };
  render() {
    return (
      <>
        <NavBar />
        <Container className="mt-3">
          <Settings ref={this.resultRef} className="mb-3" />
          <Upload
            className="mb-3"
            computeOnClick={this.computeOnClick}
            setHypfilename={this.setHypfilename}
            setReffilename={this.setReffilename}
          />
          <Result className="mb-3" />
          <Saved className="mb-3" />
        </Container>
      </>
    );
  }
}

export default App;
