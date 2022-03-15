import { useCallback, useEffect, useState } from "react";
import { useAsyncRetry } from "react-use";

const saveSetting = (key, status) => window.localStorage.setItem(key, status ? "true" : "false");

const loadSetting = (key, defaults) => {
  const setting = window.localStorage.getItem(key);
  if (setting === null && defaults.includes(key)) return true;
  return setting === "true";
};

const initPlugins = async (fetchFunction, defaults) => {
  const rawPlugins = await fetchFunction();
  if (!rawPlugins) return null;
  const plugins = {};
  Object.entries(rawPlugins).forEach(([key, value]) => {
    plugins[key] = { info: value };
  });
  Object.keys(plugins).forEach((key) => {
    plugins[key].isSet = loadSetting(key, defaults) && !plugins[key].info.disabled && plugins[key].info.healthy;
  });
  const types = [...new Set(Object.values(plugins).map(({ info }) => info.metadata.type))];
  return { plugins, types };
};

const usePlugins = (fetchFunction, defaults) => {
  const { value, loading, retry, error } = useAsyncRetry(() =>
    initPlugins(fetchFunction, defaults)
  );
  const [types, setTypes] = useState(null);
  const [plugins, setPlugins] = useState({});
  useEffect(() => {
    if (value) {
      setPlugins(value.plugins);
      setTypes(value.types);
    } else {
      setPlugins(null);
      setTypes(null);
    }
  }, [value, setPlugins]);

  const toggle = useCallback(
    (key) => {
      if (plugins[key].info.disabled || !plugins[key].info.healthy) return
      const updatedPlugins = { ...plugins };
      const plugin = { ...updatedPlugins[key] };
      plugin.isSet = !plugin.isSet;
      updatedPlugins[key] = plugin;
      saveSetting(key, plugin.isSet);
      setPlugins(updatedPlugins);
    },
    [plugins]
  );

  return { retry, error, plugins, types, loading, toggle };
};

export { usePlugins };
