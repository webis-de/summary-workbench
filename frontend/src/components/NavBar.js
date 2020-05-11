import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

const NavBar = () => (
  <Navbar className="navbar navbar-default">
    <Navbar.Brand as={Link} to={{ pathname: "/" }}>
      CompareFile
    </Navbar.Brand>
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav>
        <Nav.Link as={Link} to={{ pathname: "/compare" }}>
          Compare
        </Nav.Link>
        <Nav.Link as={Link} to={{ pathname: "/generate" }}>
          Generate
        </Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export { NavBar };
