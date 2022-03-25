import React, { useEffect } from "react";

import { ChooseFile, useFile } from "./utils/ChooseFile";
import { Label } from "./utils/Text";

const checkKey = (list, key) => {
  list.forEach((element, i) => {
    if (!(key in element)) throw new Error(`line ${i+1} does not contain the key '${key}'`);
  });
};

const validate = (list) => {
  checkKey(list, "document");
  checkKey(list, "reference");
  let keys = list.map((element) => Object.keys(element))
  keys = [].concat(...keys)
  keys = [...new Set(keys)];
  keys.forEach((key) => checkKey(list, key));
};

const Upload = ({ setComputeData }) => {
  const { fileName, lines, setFile } = useFile();

  useEffect(() => {
    try {
      if (!lines) throw new Error("no lines were input");
      const jsonl = [];
      lines.forEach((line, i) => {
        try {
          jsonl.push(JSON.parse(line));
        } catch (error) {
          throw new Error(`line ${i} is not a valid json`);
        }
      });
      validate(jsonl);
      setComputeData({ data: { id: fileName, lines: jsonl } });
    } catch (error) {
      setComputeData({ errors: [error.message] });
    }
  }, [fileName, lines]);

  return (
    <Label text="jsonl">
      <ChooseFile kind="jsonl" fileName={fileName} setFile={setFile} lines={lines} />
    </Label>
  );
};

export { Upload };
