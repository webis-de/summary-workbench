import React from "react";

import { Markup } from "../Markup";

const MarkupDisplayer = ({ paragraphedText, name, showMarkup, onHighlight }) => (
  <div
    className="uk-card uk-card-default uk-card-body uk-card-small uk-margin"
    style={{ border: "1px", borderColor: "grey", borderStyle: "solid" }}
  >
    <h1 className="uk-card-title uk-text-capitalize uk-flex uk-flex-between">
      {name}
      <button className="uk-button-primary" onClick={onHighlight}>
        {showMarkup ? "hide highlighting" : "show highlighting"}
      </button>
    </h1>
    {paragraphedText.map((markupedText, i) => (
      <p key={i}>
        <Markup markupedText={markupedText} showMarkup={showMarkup} />
      </p>
    ))}
  </div>
);

export { MarkupDisplayer };
