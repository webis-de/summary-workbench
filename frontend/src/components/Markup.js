import React from "react";

const Markup = ({ markupedText }) => (
  <>
    {markupedText.map(([text, classNames], i) => (
      <span key={i} className={classNames.join(" ")}>
        {text}
      </span>
    ))}
  </>
);

export default Markup;
