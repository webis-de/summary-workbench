import React, { useContext, useEffect, useRef, useState } from "react";
import { FaRegFile } from "react-icons/fa";

import { MetricsContext } from "../contexts/MetricsContext";
import { useCalculations } from "../hooks/calculations";
import { OneHypRef } from "./OneHypRef";
import { Result } from "./Result";
import { Saved } from "./Saved";
import { Settings } from "./Settings";
import { Upload } from "./Upload";
import { Button } from "./utils/Button";
import { Card, CardBody, CardHeader, CardTitle } from "./utils/Card";
import { CenterLoading } from "./utils/Loading";

const FileInput = ({ setCalculation }) => (
  <Card>
    <CardHeader>
      <CardTitle>
        <div className="uk-flex">
          <FaRegFile />
          <ul
            className="uk-tab dark-tab"
            data-uk-tab="connect: #choose-upload;"
            style={{ margin: "0" }}
          >
            <li>
              <a href="/#">Upload files</a>
            </li>
            <li>
              <a href="/#">Single Example</a>
            </li>
          </ul>
        </div>
      </CardTitle>
    </CardHeader>
    <CardBody>
      <ul id="choose-upload" className="uk-switcher">
        <li>
          <Upload className="uk-margin" setCalculation={setCalculation} />
        </li>
        <li>
          <OneHypRef className="uk-margin" />
        </li>
      </ul>
    </CardBody>
  </Card>
);

const Evaluate = () => {
  const [calculation, setCalculation] = useState(null);
  const setCalculationID = (id) => setCalculation((calc) => ({ ...calc, id }));
  const [scroll, setScroll] = useState(false);

  const { loading, metrics, reload } = useContext(MetricsContext);
  const {
    calculations,
    addCalculation,
    deleteCalculation,
  } = useCalculations();

  const saveCalculation = () => {
    addCalculation({...calculation, metrics });
    setCalculation(null);
  };
  const scrollRef = useRef();

  const setComputedCalculation = (calc) => {
    setCalculation(calc);
    setScroll(true);
  };

  useEffect(() => {
    if (!scroll) return null;
    const timeout = setTimeout(() => {
      if (scrollRef.current)
        scrollRef.current.scrollIntoView({ block: "start", behavior: "smooth", alignToTop: true });
      setScroll(false);
    }, 20);
    return () => clearTimeout(timeout);
  }, [scroll, setScroll]);

  if (loading) return <CenterLoading />;
  if (!metrics)
    return (
      <Button className="uk-container" onClick={reload}>
        Retry
      </Button>
    );
  return (
    <div className="uk-container uk-container-expand">
      <div className="metric-layout">
        <div>
          <FileInput setCalculation={setComputedCalculation} />
        </div>
        <div>
          <Settings className="uk-margin" />
        </div>
      </div>
      <div ref={scrollRef} style={{ scrollMarginTop: "80px" }} className="uk-margin-large-top" />
      {calculation && (
        <Result
          className="uk-margin"
          calculation={calculation}
          setCalculationID={setCalculationID}
          saveCalculation={saveCalculation}
          saveFunction={() => addCalculation(calculation)}
        />
      )}
      {calculations &&
        <Saved
          className="uk-margin"
          calculations={calculations}
          deleteCalculation={deleteCalculation}
        />
      }
    </div>
  );
};

export { Evaluate };
