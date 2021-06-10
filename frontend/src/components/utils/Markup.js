import React, { useMemo, useState } from "react";

import { computeMarkup } from "../../utils/markup";

const useMarkup = (text, sum) => useMemo(() => computeMarkup([text, sum]), [text, sum]);

const innerHoverStyle = { background: "yellow", color: "black", display: "relative" };
const baseMarkupStyle = { padding: "2px", borderRadius: "0px" };
const outerHoverStyle = { ...baseMarkupStyle, ...innerHoverStyle };

const TaggedMarkup = ({ markup, markupState, showMarkup }) => {
  let props = {};
  let style = {};
  const [content, [tag, bgcolor, fgcolor]] = markup;
  if (showMarkup) style = { ...baseMarkupStyle, background: bgcolor, color: fgcolor };
  if (markupState) {
    const [currMarkup, setCurrMarkup] = markupState;
    if (tag === currMarkup) style = showMarkup ? outerHoverStyle : innerHoverStyle;
    const onMouseEnter = showMarkup ? () => setCurrMarkup(tag) : null;
    const onMouseLeave = showMarkup ? () => setCurrMarkup(null) : null;
    props = { onMouseEnter, onMouseLeave };
  }
  return (
    <span {...props} style={style}>
      <Markup markups={content} markupState={markupState} showMarkup={false} />
    </span>
  );
};

const Markup = ({ markups, markupState, showMarkup = true }) => (
  <>
    {markups.map((child, i) =>
      typeof child === "string" ? (
        <span key={i}>{child}</span>
      ) : (
        <TaggedMarkup key={i} markup={child} markupState={markupState} showMarkup={showMarkup} />
      )
    )}
  </>
);

export { Markup, useMarkup };
