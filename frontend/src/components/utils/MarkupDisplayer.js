import React from "react";

import { Markup } from "../Markup";

const MarkupDisplayer = ({ className, markupedText, name, showMarkup }) =>
  markupedText !== null && (
    <div
      className="uk-card uk-card-default uk-card-body uk-margin"
      style={{ border: "1px", borderColor: "grey", borderStyle: "solid" }}
    >
      <h1 className="uk-card-title">{name}</h1>
      <Markup markupedText={markupedText} showMarkup={showMarkup} />
    </div>
  );

export { MarkupDisplayer };
