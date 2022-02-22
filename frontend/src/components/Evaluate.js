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
import { Card, CardContent, CardHead } from "./utils/Card";
import { CenterLoading } from "./utils/Loading";
import { Tab, TabContent, TabHead, TabPanel, Tabs } from "./utils/Tabs";
import { HeadingBig, Hint } from "./utils/Text";

const FileInput = ({ setCalculation }) => (
  <Card full>
    <Tabs>
      <CardContent>
        <TabHead border>
          <Tab>Upload files</Tab>
          <Tab>Single Example</Tab>
        </TabHead>
        <TabContent>
          <TabPanel>
            <Upload className="uk-margin" setCalculation={setCalculation} />
          </TabPanel>
          <TabPanel>
            <OneHypRef className="uk-margin" />
          </TabPanel>
        </TabContent>
      </CardContent>
    </Tabs>
  </Card>
);

const Evaluate = () => {
  const [calculation, setCalculation] = useState(null);

  const { loading, metrics, retry } = useContext(MetricsContext);
  const calc = useCalculations();

  const saveCalculation = async (id) =>
    calc.add({ ...calculation, id, metrics }).then(() => setCalculation(null));
  const scrollRef = useRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (calculation && scrollRef.current)
        scrollRef.current.scrollIntoView({ block: "start", behavior: "smooth", alignToTop: true });
    }, 20);
    return () => clearTimeout(timeout);
  }, [calculation]);

  if (loading) return <CenterLoading />;
  if (!metrics) return <Button onClick={retry}>Retry</Button>;

  return (
    <div>
      <HeadingBig>Evaluation</HeadingBig>
      <Hint>
        Evaluate a single hypothesis against a reference or upload hypothesis and reference files.
        Results can be saved and exported as LaTeX or CSV.
      </Hint>
      <div className="flex flex-row gap-3">
        <div className="grow min-w-[600px]">
          <FileInput setCalculation={setCalculation} />
        </div>
        <div>
          <Settings/>
        </div>
      </div>
      <div ref={scrollRef} className="uk-margin-large-top scroll-m-20" />
      {calculation && (
        <Result calculation={calculation} saveCalculation={saveCalculation} />
      )}
      {calc.calculations && (
        <Saved
          className="uk-margin"
          calculations={calc.calculations}
          deleteCalculation={calc.del}
        />
      )}
    </div>
  );
};

export { Evaluate };
