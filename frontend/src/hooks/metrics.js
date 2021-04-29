import { useCallback, useEffect, useReducer, useState } from "react";

import { getMetricsRequest } from "../api";
import { displayMessage } from "../utils/message";

const saveSetting = (metric, status) =>
  window.localStorage.setItem(metric, status ? "true" : "false");
const loadSetting = (metric) => window.localStorage.getItem(metric) === "true";

const useMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloading, reload] = useReducer((v) => !v, true);
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

  useEffect(() => {
    setLoading(true);
    getMetricsRequest()
      .then((data) => setMetrics(data))
      .catch(() => {
        setMetrics(null);
        setLoading(false);
        displayMessage("error fetching metrics");
      });
  }, [setLoading, setMetrics, reloading]);

  useEffect(() => {
    if (!metrics) return;
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
    setLoading(false);
  }, [metrics]);

  return { reload, metrics, metricTypes, loading, toggleSetting, settings };
};

export { useMetrics };
