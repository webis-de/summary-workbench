import React from "react";

function Markup(props) {
  const markupedText = props.markupedText;

  return (
    <>
      {markupedText.map(([text, classNames], i) => (
        <span key={i} className={classNames.join(" ")}>
          {text}
        </span>
      ))}
    </>
  );
}

export default Markup;
