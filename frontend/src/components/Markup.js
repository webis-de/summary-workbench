import React from "react";

const Markup = ({ markupedText, showMarkup = true }) => (
  <>
    {markupedText.map(([text, classNames], i) => (
      <span key={i} className={showMarkup ? classNames.join(" ") : ""}>
        {text}
      </span>
    ))}
  </>
);

export { Markup };
