import React, { useContext, useMemo, useState } from "react";
import { useAsyncFn } from "react-use";

import { evaluateRequest } from "../api";
import { MetricsContext } from "../contexts/MetricsContext";
import { useCalculations } from "../hooks/calculations";
import { getChosen, unpack } from "../utils/common";
import { collectPluginErrors } from "../utils/data";
import { OneHypRef } from "./OneHypRef";
import { Result } from "./Result";
import { Saved } from "./Saved";
import { Settings } from "./Settings";
import { Upload } from "./Upload";
import { Button, LoadingButton } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
import { sameLength } from "./utils/ChooseFile";
import { Errors } from "./utils/Error";
import { CenterLoading } from "./utils/Loading";
import { Tab, TabContent, TabHead, TabPanel, Tabs } from "./utils/Tabs";
import { HeadingBig, HeadingSemiBig, Hint } from "./utils/Text";

const FileInput = ({ loading, compute, setComputeData, disableErrors }) => (
  <Card full>
    <Tabs>
      <CardContent>
        <TabHead border>
          <Tab>Single Example</Tab>
          <Tab>Upload files</Tab>
        </TabHead>
        <TabContent>
          <TabPanel>
            <OneHypRef setComputeData={setComputeData} />
          </TabPanel>
          <TabPanel>
            <Upload setComputeData={setComputeData} />
          </TabPanel>
        </TabContent>
        <div className="flex items-center gap-5">
          {loading ? (
            <LoadingButton text="Evaluating" />
          ) : (
            <Button variant="primary" disabled={disableErrors.length} onClick={compute}>
              Evaluate
            </Button>
          )}
          <div className="flex flex-col">
            {disableErrors.map((error) => (
              <Hint key={error} type="warning" small>
                {error}
              </Hint>
            ))}
          </div>
        </div>
      </CardContent>
    </Tabs>
  </Card>
);

const SubEvaluate = () => {
  const { metrics, types, toggle, setArgument } = useContext(MetricsContext);
  const calc = useCalculations();

  const chosenMetrics = useMemo(() => Object.keys(getChosen(metrics)), [metrics]);
  const [state, doFetch] = useAsyncFn(
    async ({ id, hypotheses, references, reset = false }) => {
      if (reset) return null;
      const modelsWithArguments = Object.fromEntries(
        chosenMetrics.map((model) => [model, metrics[model].arguments])
      );
      const response = await evaluateRequest(modelsWithArguments, hypotheses, references);
      if (response.errors) return response;
      const { scores } = response.data;
      return collectPluginErrors(
        scores,
        (name, { score }) => {
          if (score) return { name, score };
          return undefined;
        },
        (elements) => ({
          id,
          scores: Object.fromEntries(elements.map(({ name, score }) => [name, score])),
          hypotheses,
          references,
        })
      );
    },
    [metrics, chosenMetrics]
  );
  const [computeData, setComputeData] = useState({});

  const saveCalculation = async (saveId) => {
    await calc.add({ ...state.value.data, id: saveId, metrics: unpack(metrics, "info") });
    doFetch({ reset: true });
  };

  const disableErrors = [];
  if (!computeData.hypotheses) {
    disableErrors.push("Input for hypotheses is missing");
  }
  if (!computeData.references) {
    disableErrors.push("Input for references is missing");
  }
  if (!sameLength([computeData.hypotheses, computeData.references])) {
    disableErrors.push("The files are not valid because they have different number of lines.");
  }
  if (!chosenMetrics.length) {
    disableErrors.push("Select at least one metric.");
  }

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
              <FileInput
                loading={state.loading}
                compute={() => doFetch(computeData)}
                setComputeData={setComputeData}
                disableErrors={disableErrors}
              />
            </div>
          </div>
          <div className="min-w-[600px]">
            <div>
              <Card full>
                <CardHead>
                  <HeadingSemiBig>Metrics</HeadingSemiBig>
                </CardHead>
                <CardContent>
                  <Settings
                    models={metrics}
                    types={types}
                    setArgument={setArgument}
                    toggleSetting={toggle}
                    type="Metrics"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {!state.loading && (
          <>
            {state.error && (
              <Hint type="danger" small>
                {state.error.message}
              </Hint>
            )}
            {state.value && (
              <>
                {state.value.errors && <Errors errors={state.value.errors} />}
                {state.value.metrics && !state.value.metrics.length && (
                  <Hint type="danger" small>
                    no scores were computed
                  </Hint>
                )}
              </>
            )}
          </>
        )}
      </div>
      {!state.loading && state.value && state.value.data && (
        <Result calculation={state.value.data} saveCalculation={saveCalculation} />
      )}
      {calc.calculations && <Saved calculations={calc.calculations} deleteCalculation={calc.del} />}
    </div>
  );
};

const Evaluate = () => {
  const { loading, metrics, retry } = useContext(MetricsContext);
  if (loading) return <CenterLoading />;
  if (!metrics) return <Button onClick={retry}>Retry</Button>;
  return <SubEvaluate />;
};

export { Evaluate };
