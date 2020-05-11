import React, { useMemo, useReducer, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Table from "react-bootstrap/Table";

import { Markup } from "./Markup";

const CompareTable = ({ comparisons }) => {
  const comparisonsLength = useMemo(() => comparisons.length, [comparisons]);
  const [start, setStart] = useReducer(
    (state, newValue) => newValue.replace(/\D/g, ""),
    "1"
  );
  const [pageSize, setPageSize] = useReducer(
    (state, newValue) => newValue.replace(/\D/g, ""),
    "3"
  );
  const [currentStart, setCurrentStart] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(3);

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
        <InputGroup className="mx-md-2 my-2">
          <InputGroup.Prepend>
            <InputGroup.Text>size</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            onChange={(e) => {
              setPageSize(e.target.value);
            }}
            onKeyDown={(e) => e.keyCode === 13 && updateComparisons()}
            value={pageSize}
          />
        </InputGroup>
        <Button className="ml-md-2 my-2" onClick={() => updateComparisons()}>
          apply
        </Button>
      </div>
      <ButtonGroup className="mb-4 mt-2 d-md-block d-flex">
        <Button onClick={() => prev()}>prev</Button>
        <Button onClick={() => next()}>next</Button>
      </ButtonGroup>
      <Table>
        <thead>
          <tr>
            {["", "hypothesis", "reference"].map((cell, i) => (
              <th key={i}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody key={currentStart + "-" + currentPageSize}>
          {comparisons
            .slice(currentStart - 1, currentStart + currentPageSize - 1)
            .map(([number, hyp, ref]) => (
              <tr key={number}>
                <td>{number}</td>
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
    </>
  );
};

export { CompareTable };
