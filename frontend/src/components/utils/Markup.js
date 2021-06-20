import React, { useMemo, useState, memo } from "react";

const innerHoverStyle = { background: "yellow", color: "black", display: "relative" };
const baseMarkupStyle = { padding: "2px", borderRadius: "0px" };
const outerHoverStyle = { ...baseMarkupStyle, ...innerHoverStyle };

const TaggedMarkup = ({ markup, markupState, showMarkup }) => {
  let props = {};
  let style = {};
  const [content, information] = markup;
  const [tag, bgcolor, fgcolor] = information
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

const StringContent = memo(({content}) => {
  const lines = content.split("\n")
  return <span>
    <>{lines[0]}</>
    {lines.slice(1).map(line => <><br/>{line}</>)}
  </span>
})

const Markup = ({ markups, markupState, matchState, showMarkup = true }) => (
  <>
    {markups.map((child, i) =>
      typeof child === "string" ? (
        <StringContent key={i} content={child} />
      ) : (
        <TaggedMarkup key={i} markup={child} markupState={markupState} showMarkup={showMarkup} matchState={matchState} />
      )
    )}
  </>
);

export { Markup };
