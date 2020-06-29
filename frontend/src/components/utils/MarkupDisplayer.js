import React from "react";

import { Markup } from "../Markup";

const MarkupDisplayer = ({ className, markupedText, name }) =>
  markupedText !== null && (
    <div className="mb-3 p-3 border">
      <h5 className="d-flex flex-row justify-content-center">{name}</h5>
      <Markup markupedText={markupedText} />
    </div>
  );

export { MarkupDisplayer };
