import React, { useContext, useMemo, useState } from "react";
import { useAsyncFn } from "react-use";

import { evaluateRequest } from "../api";
import { MetricsContext } from "../contexts/MetricsContext";
import { useCalculations } from "../hooks/calculations";
import { average, extractArgumentErrors, getChosen, mapObject } from "../utils/common";
import { collectPluginErrors } from "../utils/data";
import { flatten } from "../utils/flatScores";
import { OneHypRef } from "./OneHypRef";
import { Result } from "./Result";
import { Saved } from "./Saved";
import { Settings } from "./Settings";
import { Upload } from "./Upload";
import { Button, LoadingButton } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
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
        </div>
        <div>
          <Errors errors={disableErrors} type="warning" />
        </div>
      </CardContent>
    </Tabs>
  </Card>
);

const zipLines = (lines) => {
  const {
    document: documents,
    reference: references,
    ...models
  } = Object.fromEntries(Object.keys(lines[0]).map((key) => [key, lines.map((line) => line[key])]));
  return [documents, references, models];
};

const evaluate = async (modelsWithArguments, references, hypotheses) => {
  const response = await evaluateRequest(modelsWithArguments, references, hypotheses);
  if (response.errors) return response;
  return collectPluginErrors(
    response.data.scores,
    (name, { scores }) => {
      if (scores) return { name, scores };
      return undefined;
    },
    (elements) => ({
      scores: Object.fromEntries(elements.map(({ name, scores }) => [name, scores])),
    })
  );
};

class ScoreBuilder {
  constructor(id, metrics, documents, references, modeltexts) {
    this.id = id;
    this.scores = {};
    this.avgScores = {};
    this.documents = documents;
    this.references = references;
    this.modeltexts = modeltexts;
    this.metrics = metrics;
    this.usedMetrics = new Set();
    this.usedScores = new Set();
  }

  empty() {
    return !this.usedMetrics.size;
  }

  add(model, scores) {
    Object.keys(scores).forEach((key) => this.usedMetrics.add(this.metrics[key].info.name));
    const flattened = Object.fromEntries(flatten(scores, this.metrics));
    Object.keys(flattened).forEach((key) => this.usedScores.add(key));
    this.scores[model] = flattened;
    this.avgScores[model] = mapObject(flattened, (list) => average(list));
  }

  compile() {
    const rows = [...this.usedScores];
    const columns = [...Object.keys(this.scores)];
    rows.sort();
    columns.sort();
    const table = rows.map((row) => columns.map((column) => this.avgScores[column][row]));
    const metrics = [...this.usedMetrics];
    const { id, documents, references, modeltexts, scores } = this;
    return {
      id,
      documents,
      references,
      modeltexts,
      rows,
      columns,
      table,
      metrics,
      scores,
    };
  }
}

const SubEvaluate = () => {
  const { metrics, types, toggle, setArgument } = useContext(MetricsContext);
  const calc = useCalculations();

  const chosenMetrics = useMemo(() => Object.keys(getChosen(metrics)), [metrics]);
  const [state, doFetch] = useAsyncFn(
    async ({ id, lines, reset = false }) => {
      if (reset) return null;
      const modelsWithArguments = Object.fromEntries(
        chosenMetrics.map((model) => [model, metrics[model].arguments])
      );
      const [documents, references, models] = zipLines(lines);
      const responses = await Promise.all(
        Object.entries(models).map(async ([key, hypotheses]) => [
          key,
          await evaluate(modelsWithArguments, references, hypotheses),
        ])
      );
      const scoreBuilder = new ScoreBuilder(id, metrics, documents, references, models);
      const collectedErrors = [];
      responses.forEach(([key, { data, errors }]) => {
        if (data) scoreBuilder.add(key, data.scores);
        if (errors) collectedErrors.push({ name: key, errors });
      });
      const data = {};
      if (!scoreBuilder.empty()) data.data = scoreBuilder.compile();
      if (collectedErrors.length) data.errors = collectedErrors;
      return data;
    },
    [metrics, chosenMetrics]
  );
  const [{ data, errors }, setComputeData] = useState({});
  const argErrors = useMemo(
    () => extractArgumentErrors(chosenMetrics, metrics), [(chosenMetrics, metrics)]
  );

  const saveCalculation = async (calculation) => {
    await calc.add(calculation);
    doFetch({ reset: true });
  };

  const disableErrors = [];
  if (errors) disableErrors.push(...errors);
  if (argErrors) disableErrors.push(...argErrors);
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
                compute={() => doFetch(data)}
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
                {!state.value.data && (
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
