import React from "react";

const Markup = (props) => (
  <>
    {props.markupedText.map(([text, classNames], i) => (
      <span key={i} className={classNames.join(" ")}>
        {text}
      </span>
    ))}
  </>
);

export { Markup };
