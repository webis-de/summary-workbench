import React, { useEffect, useMemo, useReducer, useState } from "react";

import { toCSV, toLatex } from "../utils/export";
import { Button } from "./utils/Button";

const LatexButton = ({ onClick }) => <Button onClick={onClick}>Latex</Button>;
const CSVButton = ({ onClick }) => <Button onClick={onClick}>CSV</Button>;

const TransposeButton = ({ transpose, onClick }) => (
  <Button size="small" variant={transpose ? "default" : "primary"} onClick={onClick}>
    transpose
  </Button>
);

const ExportPreview = ({ text }) => (
  <pre className="uk-padding-small" style={{ border: "solid 1px grey" }}>
    {text}
  </pre>
);

const PrecionField = ({ onChange }) => (
  <input className="uk-input" placeholder="precision" onChange={onChange} />
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
      <table className="uk-table uk-table-divider uk-table-small uk-table-middle">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {flatScores.map(([metric, score]) => (
            <tr key={metric}>
              <td>{metric}</td>
              <td>{score.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        className="uk-flex uk-flex-between uk-flex-middle uk-flex-wrap-reverse uk-margin"
        style={{ gridRowGap: "20px" }}
      >
        <div className="uk-flex">
          <CSVButton onClick={() => setFormat("csv")} />
          <LatexButton onClick={() => setFormat("latex")} />
        </div>
      </div>
      {exportText && (
        <div>
          <div className="uk-flex">
            <PrecionField
              onChange={(e) => {
                updatePrecision(e.currentTarget.value);
              }}
            />
            <TransposeButton transpose={transpose} onClick={() => toggleTranspose()} />
          </div>
          <ExportPreview text={exportText} />
        </div>
      )}
    </>
  );
};

export { ScoreTable };
