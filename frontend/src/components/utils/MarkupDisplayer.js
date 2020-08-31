import React from "react";

import { Markup } from "../Markup";

const MarkupDisplayer = ({ className, paragraphedText, name, showMarkup, maxHeight=null, minHeight=null }) => {
  let extraStyle = {overflowX: "hidden"}
  if (maxHeight !== null) {
    extraStyle = {overflow: "scroll", maxHeight: maxHeight, ...extraStyle}
  }
  if (minHeight !== null) {
    extraStyle = {overflow: "scroll", minHeight: minHeight, ...extraStyle}
  }
  if (paragraphedText !== null) {
    return  <div
      className="uk-card uk-card-default uk-card-body uk-card-small uk-margin"
      style={{ border: "1px", borderColor: "grey", borderStyle: "solid", ...extraStyle }}
    >
      <h1 className="uk-card-title uk-text-capitalize">{name}</h1>
      {paragraphedText.map((markupedText, i) => (
        <p key={i}>
          <Markup markupedText={markupedText} showMarkup={showMarkup} />
        </p>
      ))}
    </div>
  }
}

export { MarkupDisplayer };