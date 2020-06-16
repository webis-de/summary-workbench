import React, { useMemo, useReducer, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Table from "react-bootstrap/Table";

import { Markup } from "./Markup";

const defaultStart = 1;
const defaultPageSize = 1;

const ComparisonDisplay = ({ start, size, comparisons }) => (
  <Table>
    <thead>
      <tr>
        {["", "hypothesis", "reference"].map((cell, i) => (
          <th key={i}>{cell}</th>
        ))}
      </tr>
    </thead>
    <tbody key={start + "-" + size}>
      {comparisons.slice(start - 1, start + size - 1).map(([hyp, ref], i) => (
        <tr key={i + start}>
          <td>{i + start}</td>
          <td>
            <Markup markupedText={hyp} />
          </td>
          <td>
            <Markup markupedText={ref} />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

const SizeInput = ({ onChange, onKeyDown, pageSize }) => (
  <InputGroup className="mx-md-2 my-2">
    <InputGroup.Prepend>
      <InputGroup.Text>size</InputGroup.Text>
    </InputGroup.Prepend>
    <FormControl onChange={onChange} onKeyDown={onKeyDown} value={pageSize} />
  </InputGroup>
);

const CompareTable = ({ comparisons }) => {
  const comparisonsLength = useMemo(() => comparisons.length, [comparisons]);
  const [start, setStart] = useReducer(
    (state, newValue) => newValue.replace(/\D/g, ""),
    defaultStart.toString()
  );
  const [pageSize, setPageSize] = useReducer(
    (state, newValue) => newValue.replace(/\D/g, ""),
    defaultPageSize.toString()
  );
  const [currentStart, setCurrentStart] = useState(defaultStart);
  const [currentPageSize, setCurrentPageSize] = useState(defaultPageSize);

  const updateComparisons = () => {
    if (!isNaN(start)) {
      const s = Math.max(1, Math.min(comparisonsLength, parseInt(start)));
      setStart(s.toString());
      if (!isNaN(pageSize)) {
        const p = Math.max(1, pageSize);
        setPageSize(p.toString());
        setCurrentStart(s);
        setCurrentPageSize(p);
      } else {
        alert("choose valid pageSize");
      }
    } else {
      alert("choose valid start");
    }
  };

  const prev = () => {
    const nextStart = Math.max(1, currentStart - currentPageSize);
    setPageSize(currentPageSize.toString());
    setCurrentStart(nextStart);
    setStart(nextStart.toString());
  };

  const next = () => {
    const nextStart = Math.min(
      comparisonsLength,
      currentStart + currentPageSize
    );
    setPageSize(currentPageSize.toString());
    setCurrentStart(nextStart);
    setStart(nextStart.toString());
  };

  return (
    <>
      <div className="d-flex flex-md-row flex-column">
        <InputGroup className="mr-md-2 my-2">
          <InputGroup.Prepend>
            <InputGroup.Text>start</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            onChange={(e) => {
              setStart(e.target.value);
            }}
            onKeyDown={(e) => e.keyCode === 13 && updateComparisons()}
            value={start}
          />
          <InputGroup.Append>
            <InputGroup.Text>of {comparisonsLength}</InputGroup.Text>
          </InputGroup.Append>
        </InputGroup>
        <SizeInput
          onChange={(e) => {
            setPageSize(e.target.value);
          }}
          onKeyDown={(e) => e.keyCode === 13 && updateComparisons()}
          pageSize={pageSize}
        />
        <Button className="ml-md-2 my-2" onClick={() => updateComparisons()}>
          apply
        </Button>
      </div>
      <ButtonGroup className="mb-4 mt-2 d-md-block d-flex">
        <Button onClick={() => prev()}>prev</Button>
        <Button onClick={() => next()}>next</Button>
      </ButtonGroup>
      <ComparisonDisplay
        start={currentStart}
        size={currentPageSize}
        comparisons={comparisons}
      />
    </>
  );
};

export { CompareTable };
