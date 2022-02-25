import { useCallback, useEffect, useState } from "react";
import { useAsync } from "react-use";

import { getMetricsRequest } from "../api";

const saveSetting = (metric, status) =>
  window.localStorage.setItem(metric, status ? "true" : "false");

const loadSetting = (metric) => {
  const setting = window.localStorage.getItem(metric);
  if (setting === null && metric === "anonymous-rouge") return true;
  return setting === "true";
};

const useMetrics = () => {
  const [metricTypes, setMetricTypes] = useState(null);
  const [settings, setSettings] = useState(null);

  const toggleSetting = useCallback(
    (metric) => {
      const newSettings = { ...settings };
      const newValue = !settings[metric];
      newSettings[metric] = newValue;
      saveSetting(metric, newValue);
      setSettings(newSettings);
    },
    [settings]
  );

  const { value: metrics, loading, retry, error } = useAsync(getMetricsRequest);

  useEffect(() => {
    if (!metrics) {
      setMetricTypes({});
      setSettings({});
      return;
    }
    const types = {};
    Object.entries(metrics).forEach(([metric, { type }]) => {
      if (types[type]) types[type].push(metric);
      else types[type] = [metric];
    });
    const newSettings = {};
    Object.keys(metrics).forEach((metric) => {
      newSettings[metric] = loadSetting(metric);
    });
    setMetricTypes(types);
    setSettings(newSettings);
  }, [metrics, setMetricTypes, setSettings]);

  return { retry, error, metrics, metricTypes, loading, toggleSetting, settings };
};

export { useMetrics };
