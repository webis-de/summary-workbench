import React, { useContext, useEffect, useState } from "react";
import { useAsyncFn } from "react-use";

import { evaluateRequest } from "../api";
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
import { HeadingBig, HeadingSemiBig, Hint } from "./utils/Text";
import { unpack } from "../utils/common"

const FileInput = ({ compute, computing }) => (
  <Card full>
    <Tabs>
      <CardContent>
        <TabHead border>
          <Tab>Single Example</Tab>
          <Tab>Upload files</Tab>
        </TabHead>
        <TabContent>
          <TabPanel>
            <OneHypRef />
          </TabPanel>
          <TabPanel>
            <Upload compute={compute} computing={computing} />
          </TabPanel>
        </TabContent>
      </CardContent>
    </Tabs>
  </Card>
);

const Evaluate = () => {
  const { loading, metrics, types, retry, toggle } = useContext(MetricsContext);
  console.log(retry)
  const calc = useCalculations();

  const [state, doFetch] = useAsyncFn(async (id, chosenMetrics, hypotheses, references) => {
    const { scores } = await evaluateRequest(chosenMetrics, hypotheses, references);
    return { id, scores, hypotheses, references };
  }, []);
  const [calculation, setCalculation] = useState(null);
  useEffect(() => setCalculation(state.value), [state.value]);

  const saveCalculation = async (id) => {
    await calc.add({ ...calculation, id, metrics: unpack(metrics, "info") });
    setCalculation(null);
  };

  if (loading) return <CenterLoading />;
  if (!metrics) return <Button onClick={retry}>Retry</Button>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="pb-4">
          <HeadingBig>Evaluation Predictions</HeadingBig>
          <Hint>
            Evaluate using multiple metrics a single prediction against a reference text, or upload
            both of them as files. After computing the metrics, a visual comparison between two
            texts can be made that shows the overlapping tokens. Scores from evaluation metrics can
            be exported in LaTeX (table) or CSV format.
          </Hint>
        </div>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="grow min-w-[400px]">
            <div>
              <FileInput compute={doFetch} computing={state.loading} />
            </div>
          </div>
          <div className="min-w-[600px]">
            <div>
              <Card full>
                <CardHead>
                  <HeadingSemiBig>Metrics</HeadingSemiBig>
                </CardHead>
                <CardContent>
                  <Settings models={metrics} types={types} toggleSetting={toggle} type="Metrics" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {!state.loading && calculation && (
        <Result calculation={calculation} saveCalculation={saveCalculation} />
      )}
      {calc.calculations && <Saved calculations={calc.calculations} deleteCalculation={calc.del} />}
    </div>
  );
};

export { Evaluate };
