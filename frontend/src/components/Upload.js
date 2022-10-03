import React, { useEffect, useMemo, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";

import { ofilter, omap } from "../utils/common";
import { Button } from "./utils/Button";
import { ChooseFile, useFile } from "./utils/ChooseFile";
import { Checkbox } from "./utils/Form";
import { HeadingSmall } from "./utils/Text";
import { Tooltip } from "./utils/Tooltip";

const checkKey = (list, key) => {
  list.forEach((element, i) => {
    if (!(key in element)) throw new Error(`line ${i + 1} does not contain the key '${key}'`);
  });
};

const validate = (list) => {
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
          throw new Error(`line ${i} is not a valid json: ${error}`);
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
  }, [fileName, lines, setComputeData]);

  useEffect(() => {
    if (data) {
      const { id, jsonl, chosenKeys } = data;
      const keys = Object.keys(ofilter(chosenKeys, (_, v) => v));
      setComputeData({ data: { id, lines: jsonl, chosenKeys: keys } });
    }
  }, [data, setComputeData]);

  const toggleModel = (model) => {
    const { chosenKeys } = data;
    const nextValue = !chosenKeys[model];
    setData({ ...data, chosenKeys: { ...chosenKeys, [model]: nextValue } });
  };

  const allIsChecked = useMemo(
    () => data && Object.values(data.chosenKeys).every((e) => e),
    [data]
  );

  const toggleAll = () => {
    setData({ ...data, chosenKeys: omap(data.chosenKeys, () => !allIsChecked) });
  };

  return (
    <div>
      <div>
        <div className="flex justify-between pb-2">
          <div className="flex items-center gap-2">
            <HeadingSmall>jsonl</HeadingSmall>
            <Tooltip place="right" text="The file has to contain a json object on each line. All objects have to contain the same keys. The 'reference' key is required and the 'document' key is optional. All other keys are interpreted as models.">
              <FaQuestionCircle size={18} className="text-blue-500 hover:text-blue-700" />
            </Tooltip>
          </div>
          <Button
            variant="primary"
            appearance="soft"
            href="/static/example.jsonl"
            small
            download
          >
            Download Sample File
          </Button>
        </div>
        <ChooseFile kind="jsonl" fileName={fileName} setFile={setFile} lines={lines} />
      </div>

      {data && (
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {Object.entries(data.chosenKeys).map(([model, checked]) => (
              <Checkbox key={model} checked={checked} onChange={() => toggleModel(model)}>
                {model}
              </Checkbox>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            <Checkbox checked={allIsChecked} onChange={toggleAll} bold>
              toggle all
            </Checkbox>
          </div>
        </>
      )}
    </div>
  );
};

export { Upload };
