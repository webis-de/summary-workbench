import React from "react";

import { Markup } from "../Markup";

const MarkupDisplayer = ({ className, markupedText, name }) =>
  markupedText !== null && (
  <div className="uk-card uk-card-default uk-card-body uk-margin">
    <h1 className="uk-card-title">{name}</h1>
      <Markup markupedText={markupedText} />
    </div>
  );

export { MarkupDisplayer };
