import React from "react";

const Section = ({ className, title, children }) => (
  <div
    className={"uk-card uk-card-default uk-card-body uk-padding-small" + (className === undefined ? "" : " " + className)}
    style={{ border: "1px solid grey" }}
  >
    <h4 className="uk-card-title">{title}</h4>
    {children}
  </div>
);

export { Section };
