import React, { useContext, useMemo, useState } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { PluginCard } from "./About";
import { ModelGrid } from "./Model";
import { DismissableBadge } from "./utils/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "./utils/Card";
import { Checkboxes } from "./utils/Checkboxes";
import { LiveSearch, useFilter } from "./utils/FuzzySearch";

const getChosenMetrics = (settings) =>
  Object.entries(settings)
    .filter((e) => e[1])
    .map((e) => e[0]);

const Settings = () => {
  const { metrics, settings, toggleSetting, metricTypes } = useContext(MetricsContext);
  const metricKeys = useMemo(() => Object.keys(metrics).sort(), [metrics]);
  const { query, setQuery, filteredKeys } = useFilter(metricKeys);
  const [selectedMetric, setSelectedMetric] = useState(null);

  const selectMetric = (key) => {
    if (settings[key]) setSelectedMetric(null);
    else setSelectedMetric(key);
    toggleSetting(key);
  };
  const unselectMetric = (key) => {
    toggleSetting(key);
    if (selectedMetric === key) setSelectedMetric(null);
  };

  const chosenMetrics = getChosenMetrics(settings);

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
          <span style={{ marginRight: "10px" }}>Metrics</span>
          <LiveSearch query={query} setQuery={setQuery} />
        </CardTitle>
      </CardHeader>
      <CardBody>
        <ModelGrid
          keys={filteredKeys}
          models={metrics}
          settings={settings}
          selectModel={selectMetric}
        />
        <div className="uk-flex" style={{ alignItems: "center", gap: "5px", marginTop: "30px" }}>
          <span className="colored-header">selected:</span>
          {chosenMetrics.map((model) => (
            <DismissableBadge onClick={() => unselectMetric(model)} key={model}>
              <a
                href="/#"
                className="nostyle"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedMetric(model);
                }}
              >
                {metrics[model].name}
              </a>
            </DismissableBadge>
          ))}
        </div>
        {selectedMetric && (
          <div style={{ marginTop: "30px" }}>
            <PluginCard plugin={metrics[selectedMetric]} inline={false} />
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export { Settings };
