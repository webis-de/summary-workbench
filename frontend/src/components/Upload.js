import React, { useEffect, useState } from "react";

import { filterObject } from "../utils/common";
import { ChooseFile, useFile } from "./utils/ChooseFile";
import { Checkbox } from "./utils/Form";
import { Label } from "./utils/Text";

const checkKey = (list, key) => {
  list.forEach((element, i) => {
    if (!(key in element)) throw new Error(`line ${i + 1} does not contain the key '${key}'`);
  });
};

const validate = (list) => {
  checkKey(list, "document");
  checkKey(list, "reference");
  let keys = list.map((element) => Object.keys(element));
  keys = [].concat(...keys);
  keys = [...new Set(keys)];
  keys.forEach((key) => checkKey(list, key));
};

const Upload = ({ setComputeData }) => {
  const { fileName, lines, setFile } = useFile();

  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      if (!lines || !lines.length) throw new Error("no lines were input");
      const jsonl = [];
      lines.forEach((line, i) => {
        try {
          jsonl.push(JSON.parse(line));
        } catch (error) {
          throw new Error(`line ${i} is not a valid json`);
        }
      });
      validate(jsonl);
      const chosenKeys = Object.fromEntries(
        Object.keys(jsonl[0])
          .filter((k) => !["document", "reference"].includes(k))
          .map((k) => [k, true])
      );
      setData({ id: fileName, jsonl, chosenKeys });
    } catch (error) {
      setData(null);
      setComputeData({ errors: [error.message] });
    }
  }, [fileName, lines]);

  useEffect(() => {
    if (data) {
      const { id, jsonl, chosenKeys } = data;
      const keys = Object.keys(filterObject(chosenKeys, (_, v) => v));
      setComputeData({ data: { id, lines: jsonl, chosenKeys: keys } });
    }
  }, [data]);

  const toggleModel = (model) => {
    const { chosenKeys } = data;
    const nextValue = !chosenKeys[model];
    setData({ ...data, chosenKeys: { ...chosenKeys, [model]: nextValue } });
  };

  return (
    <Label text="jsonl">
      <ChooseFile kind="jsonl" fileName={fileName} setFile={setFile} lines={lines} />

      {data && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
          {Object.entries(data.chosenKeys).map(([model, checked]) => (
            <Checkbox key={model} checked={checked} onChange={() => toggleModel(model)}>
              {model}
            </Checkbox>
          ))}
        </div>
      )}
    </Label>
  );
};

export { Upload };
