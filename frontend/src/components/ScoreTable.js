import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { FaCheck, FaRegCopy } from "react-icons/fa";
import { useToggle } from "react-use";

import formatters from "../utils/export";
import { Button } from "./utils/Button";
import { Input } from "./utils/Form";
import { ButtonGroup, RadioButton, RadioGroup } from "./utils/Radio";
import { Table, TableWrapper, Tbody, Td, Th, Thead, Tr } from "./utils/Table";
import { HeadingSemiBig, HeadingSmall } from "./utils/Text";
import { Toggle } from "./utils/Toggle";

const CopyToClipboardButton = ({ text }) => {
  const [saved, setSaved] = useState(false);
  const timeout = useRef();
  const onClick = () => {
    navigator.clipboard.writeText(text);
    setSaved(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setSaved(false), 1000);
  };
  if (saved)
    return (
    <div className="p-[1px]">
      <Button variant="success">
        <FaCheck />
      </Button>
    </div>
    );
  return (
      <Button appearance="outline" variant="primary" onClick={onClick}>
        <FaRegCopy />
      </Button>
  );
};

const ExportPreview = ({ format, flatScores }) => {
  const [transpose, toggleTranspose] = useToggle(true);
  const [precision, setPrecision] = useState(3);
  const updatePrecision = (newValue) => {
    let value = parseInt(newValue.replace(/\D/g, "") || "3", 10);
    if (value > 30) value = 30;
    setPrecision(value);
  };

  const text = useMemo(
    () => formatters[format](flatScores, transpose, precision),
    [format, transpose, precision, flatScores]
  );
  return (
    <div className="pt-5">
      <pre className="relative p-3 border-1 border-gray-900">
        <div className="absolute right-3 top-3">
          <div className="flex items-center gap-4">
            <div className="w-16">
              <Input
                placeholder="digits"
                small
                right
                onChange={(e) => {
                  updatePrecision(e.currentTarget.value);
                }}
              />
            </div>
            <div className="flex items-center gap-1">
              <HeadingSmall>transpose</HeadingSmall>
              <Toggle checked={transpose} onChange={() => toggleTranspose()} />
            </div>
            <CopyToClipboardButton text={text} />
          </div>
        </div>
        {text}
      </pre>
    </div>
  );
};

const ScoreTable = ({ flatScores }) => {
  const [format, setFormat] = useState(null);
  useEffect(() => setFormat(null), [flatScores]);
  return (
    <div>
      <TableWrapper>
        <Table>
          <Thead>
            <Th>Metric</Th>
            <Th>Score</Th>
          </Thead>
          <Tbody>
            {flatScores.map(([metric, score]) => (
              <Tr key={metric} hover striped>
                <Td>{metric}</Td>
                <Td>{score.toFixed(3)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableWrapper>
      <div className="mt-5 flex items-center gap-8">
        <HeadingSemiBig>Export</HeadingSemiBig>
        <RadioGroup value={format} setValue={setFormat}>
          <ButtonGroup direction="horizontal">
            {Object.keys(formatters).map((formatter) => (
              <RadioButton key={formatter} value={formatter}>
                <span className="uppercase">{formatter}</span>
              </RadioButton>
            ))}
          </ButtonGroup>
        </RadioGroup>
      </div>
      {format && <ExportPreview format={format} flatScores={flatScores} />}
    </div>
  );
};

export { ScoreTable };
