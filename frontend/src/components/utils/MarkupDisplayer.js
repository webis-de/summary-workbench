import React from "react";

import { Markup } from "../Markup";

const MarkupDisplayer = ({ className, paragraphedText, name, showMarkup }) =>
  paragraphedText !== null && (
    <div
      className="uk-card uk-card-default uk-card-body uk-margin"
      style={{ border: "1px", borderColor: "grey", borderStyle: "solid" }}
    >
      <h1 className="uk-card-title">{name}</h1>
      {paragraphedText.map((markupedText, i) => (
        <p key={i}>
          <Markup markupedText={markupedText} showMarkup={showMarkup} />
        </p>
      ))}
    </div>
  );

export { MarkupDisplayer };
