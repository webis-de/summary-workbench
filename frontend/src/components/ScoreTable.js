import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { FaCheck, FaRegCopy } from "react-icons/fa";

import { toCSV, toLatex } from "../utils/export";
import { Button } from "./utils/Button";
import { Table, TableWrapper, Tbody, Td, Th, Thead, Tr } from "./utils/Table";
import { Input } from "./utils/Form";

const createFormatButton =
  (kind) =>
  ({ format, setFormat }) =>
    (
      <Button variant={format === kind ? "primary" : "default"} onClick={() => setFormat(kind)}>
        {kind.toUpperCase()}
      </Button>
    );
const LatexButton = createFormatButton("csv");
const CSVButton = createFormatButton("latex");

const TransposeButton = ({ transpose, onClick }) => (
  <Button size="small" variant={transpose ? "default" : "primary"} onClick={onClick}>
    transpose
  </Button>
);

const CopyToClipboardButton = ({ text }) => {
  const [saved, setSaved] = useState(false);
  const timeout = useRef();
  const onClick = () => {
    navigator.clipboard.writeText(text);
    setSaved(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setSaved(false), 1000);
  };
  return (
    <Button
      size="small"
      title="copy"
      onClick={onClick}
      style={{ padding: "5px", backgroundColor: "white", borderRadius: "2px" }}
    >
      {saved ? (
        <FaCheck style={{ width: "30px", color: "green" }} />
      ) : (
        <FaRegCopy style={{ width: "30px" }} />
      )}
    </Button>
  );
};

const ExportPreview = ({ text }) => (
  <pre style={{ border: "solid 1px grey", position: "relative", padding: "10px" }}>
    <div style={{ position: "absolute", right: "10px", top: "10px" }}>
      <CopyToClipboardButton text={text} />
    </div>
    {text}
  </pre>
);

const PrecionField = ({ onChange }) => (
  <Input placeholder="round values up to X points" onChange={onChange} />
);

const ScoreTable = ({ flatScores }) => {
  const [format, setFormat] = useState(null);
  useEffect(() => setFormat(null), [flatScores]);
  const [transpose, toggleTranspose] = useReducer((state) => !state, true);
  const [precision, setPrecision] = useState(3);
  const updatePrecision = (newValue) => {
    let value = parseInt(newValue.replace(/\D/g, "") || "3", 10);
    if (value > 30) value = 30;
    setPrecision(value);
  };
  const exportText = useMemo(() => {
    switch (format) {
      case "csv":
        return toCSV(flatScores, transpose, precision);
      case "latex":
        return toLatex(flatScores, transpose, precision);
      default:
        return null;
    }
  }, [format, transpose, precision, flatScores]);
  return (
    <>
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

      <div
        className="uk-flex uk-flex-between uk-flex-middle uk-flex-wrap-reverse uk-margin"
        style={{ gridRowGap: "20px" }}
      >
        <div className="uk-flex uk-flex-middle">
          <span className="uk-form-label" style={{ fontSize: "1.2em", marginRight: "20px" }}>
            Export Results
          </span>
          <CSVButton format={format} setFormat={setFormat} />
          <LatexButton format={format} setFormat={setFormat} />
          <div style={{ width: "30px" }} />
          {exportText && (
            <div className="uk-flex" style={{ maxWidth: "500px" }}>
              <PrecionField
                onChange={(e) => {
                  updatePrecision(e.currentTarget.value);
                }}
              />
              <TransposeButton transpose={transpose} onClick={() => toggleTranspose()} />
              <div style={{ width: "30px" }} />
            </div>
          )}
        </div>
      </div>
      {exportText && <ExportPreview text={exportText} />}
    </>
  );
};

export { ScoreTable };
