import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

const NavBar = () => (
  <Navbar className="pb-3">
    <Navbar.Brand as={Link} to={{ pathname: "/" }}>
      CompareFile
    </Navbar.Brand>
    <Navbar.Collapse>
      <Nav className="d-flex flex-grow-1">
        <Nav.Link as={Link} to={{ pathname: "/compare" }}>
          Compare
        </Nav.Link>
        <Nav.Link as={Link} to={{ pathname: "/summarize" }}>
          Summarize
        </Nav.Link>
        <Nav.Link className="ml-auto" as={Link} to={{ pathname: "/about" }}>
          About
        </Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export { NavBar };
