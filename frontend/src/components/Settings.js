import React, { useContext, useMemo, useState } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { ModelGrid } from "./Model";
import { DismissableBadge } from "./utils/Badge";
import { Card, CardContent, CardHead } from "./utils/Card";
import { LiveSearch, useFilter } from "./utils/FuzzySearch";
import { PluginCard } from "./utils/PluginCard";
import { HeadingSemiBig } from "./utils/Text";

const getChosenMetrics = (settings) =>
  Object.entries(settings)
    .filter((e) => e[1])
    .map((e) => e[0]);

const Settings = () => {
  const { metrics, settings, toggleSetting } = useContext(MetricsContext);
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
    <Card full>
      <CardHead>
        <HeadingSemiBig>Metrics</HeadingSemiBig>
      </CardHead>
      <CardContent>
        <LiveSearch query={query} setQuery={setQuery} />
        <ModelGrid
          keys={filteredKeys}
          models={metrics}
          settings={settings}
          selectModel={selectMetric}
        />
        <div className="flex flex-wrap items-center gap-5">
          <span className="colored-header">selected:</span>
          {chosenMetrics.map((model) => (
            <DismissableBadge onClick={() => unselectMetric(model)} key={model}>
              <a
                href="/#"
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
      </CardContent>
    </Card>
  );
};

export { Settings };
