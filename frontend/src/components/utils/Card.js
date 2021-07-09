import React from "react";

const Card = ({ className, children, ...props }) => (
  <div className={`uk-card uk-card-default ${className || ""}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children }) => <div className="card-header uk-text-middle">{children}</div>;

const CardBody = ({ children }) => <div className="uk-card-body">{children}</div>;

const CardTitle = ({children, style}) => <div className="card-title" style={style} >{children}</div>;

export { Card, CardHeader, CardTitle, CardBody };
