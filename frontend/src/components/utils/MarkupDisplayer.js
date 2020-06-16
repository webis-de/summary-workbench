import React from "react";

import { Markup } from "../Markup";

const MarkupDisplayer = ({ className, markupedText, name }) =>
  markupedText !== null && (
    <div className="mb-3 p-3 border">
      <h6 className="d-flex flex-row justify-content-center">{name}</h6>
      <Markup markupedText={markupedText} />
    </div>
  );

export { MarkupDisplayer };
