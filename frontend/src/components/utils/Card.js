import React from "react";

const Card = ({ className, title, children, ...other }) => (
  <div {...other} className={`uk-card uk-card-default${className ? "" : ` ${className}`}`}>
    <div className="card-header uk-text-middle">{title}</div>
    <div className="uk-card-body">{children}</div>
  </div>
);

export { Card };
