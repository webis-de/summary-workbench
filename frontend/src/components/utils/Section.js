import React from "react";

const Section = ({ className, title, children }) => (
  <div
    className={"uk-card uk-card-default uk-card-body uk-padding-small left-border" + (className === undefined ? "" : " " + className)}
  >
    <h4 className="uk-card-title">{title}</h4>
    {children}
  </div>
);

export { Section };
