import React from "react";

const Section = ({ className, title, children }) => (
  <div
    className={"uk-card uk-card-default" + (className === undefined ? "" : " " + className)}
  >
    <div className="card-header uk-text-middle">
      {title}
    </div>
    <div className="uk-card-body">
    {children}
    </div>
  </div>
);

export { Section };
