import React, { useContext, useMemo, useState } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { PluginCard } from "./About";
import { Model } from "./Model";
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
    toggleSetting(key);
    if (selectedMetric === key) setSelectedMetric(null);
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
        <div className="margin-between-10">
          {Object.values(metrics).length ? (
            filteredKeys.map((key) => (
              <Model
                key={key}
                info={metrics[key]}
                onClick={() => selectMetric(key)}
                isSet={settings[key]}
              />
            ))
          ) : (
            <div>no metrics configured</div>
          )}
        </div>
        <div className="colored-header" style={{ marginTop: "30px" }}>
          Selected Metrics
        </div>
        <div className="margin-between-5" style={{ marginLeft: "20px", marginBottom: "10px" }}>
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
        {selectedMetric && <PluginCard plugin={metrics[selectedMetric]} inline={false} />}
      </CardBody>
    </Card>
  );
};

export { Settings };
