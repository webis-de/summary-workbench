import React from "react";

const Section = ({ className, children }) => (
  <div
    className={"uk-section uk-padding-small" + (className === undefined ? "" : " " + className)}
    style={{ border: "1px solid grey", borderRadius: "5px" }}
  >
    {children}
  </div>
);

export { Section };
