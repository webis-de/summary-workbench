import { useCallback, useEffect, useState } from "react";
import { useAsyncRetry } from "react-use";

import { getSummarizersRequest } from "../api";

const defaultSummarizers = ["anonymous-textrank", "anonymous-bart-cnn"];
const saveSetting = (summarizer, status) =>
  window.localStorage.setItem(summarizer, status ? "true" : "false");
const loadSetting = (summarizer) => {
  const setting = window.localStorage.getItem(summarizer);
  if (setting === null && defaultSummarizers.includes(summarizer)) return true;
  return setting === "true";
};

const useSummarizers = () => {
  const [summarizerTypes, setSummarizerTypes] = useState({});
  const [settings, setSettings] = useState({});

  const toggleSetting = useCallback(
    (summarizer) => {
      const newSettings = { ...settings };
      const newValue = !settings[summarizer];
      newSettings[summarizer] = newValue;
      saveSetting(summarizer, newValue);
      setSettings(newSettings);
    },
    [settings]
  );

  const { value: summarizers, loading, retry, error } = useAsyncRetry(getSummarizersRequest);

  useEffect(() => {
    if (!summarizers) {
      setSummarizerTypes({});
      setSettings({})
      return
    }
    const types = {};
    Object.entries(summarizers).forEach(([summarizer, { type }]) => {
      if (types[type]) types[type].push(summarizer);
      else types[type] = [summarizer];
    });
    const newSettings = {};
    Object.keys(summarizers).forEach((summarizer) => {
      newSettings[summarizer] = loadSetting(summarizer);
    });
    setSummarizerTypes(types);
    setSettings(newSettings);
  }, [summarizers, setSettings, setSummarizerTypes]);

  return { error, retry, summarizers, summarizerTypes, loading, toggleSetting, settings };
};

export { useSummarizers };
