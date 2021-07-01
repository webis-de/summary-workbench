import React, { useEffect, useState } from "react";

import { displayError } from "../../utils/message";
import { readFile } from "../../utils/readFile";

const numberOfLines = (string) => {
  let numLines = 1;
  const { length } = string;
  for (let i = 0; i < length; i++) {
    if (string[i] === "\n") {
      numLines++;
    }
  }
  return numLines;
};

const useFile = (file) => {
  const [numLines, setNumLines] = useState(null);
  useEffect(() => {
    if (file) {
      readFile(file)
        .then((text) => text.trim())
        .then((text) => setNumLines(numberOfLines(text)))
        .catch(displayError);
    }
  }, [file]);

  return [numLines];
};

export { useFile };
