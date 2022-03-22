import { useCallback, useEffect, useState } from "react";
import { useAsyncRetry } from "react-use";

const saveSetting = (key, status) => window.localStorage.setItem(key, status ? "true" : "false");

const loadSetting = (key, defaults) => {
  const setting = window.localStorage.getItem(key);
  if (setting === null && defaults.includes(key)) return true;
  return setting === "true";
};

const defaultNumberArgument = (min, max) => {
  if (min !== undefined) return min
  if (max !== undefined) return max
  return 0
}

const argumentToDefault = ({type, default: def, categories, min, max}) => {
  if (def !== undefined && def !== null) return def
  switch (type) {
    case "str": return "";
    case "int": return defaultNumberArgument(min, max);
    case "float": return defaultNumberArgument(min, max);
    case "categorical": return categories[0];
    case "bool": return false;
    default: throw new Error(`unknown type ${type}`)
  }
}

const initPlugins = async (fetchFunction, defaults) => {
  const rawPlugins = await fetchFunction();
  if (!rawPlugins) return null;
  const plugins = {};
  Object.entries(rawPlugins).forEach(([key, value]) => {
    const isSet = loadSetting(key, defaults) && !value.disabled && value.healthy;
    let args = value.arguments || {};
    if (value.arguments) {
      args = Object.fromEntries(
        Object.entries(value.arguments).map(([argName, argDef]) => [argName, argumentToDefault(argDef)])
      );
    }
    const info = { ...value };
    if (!info.metadata.type) info.metadata.type = "unknown";
    plugins[key] = { info, isSet, arguments: args };
  });
  const types = [...new Set(Object.values(plugins).map(({ info }) => info.metadata.type))];
  return { plugins, types };
};

const usePlugins = (fetchFunction, defaults) => {
  const { value, loading, retry, error } = useAsyncRetry(() =>
    initPlugins(fetchFunction, defaults)
  );
  const [plugins, setPlugins] = useState(null);
  const [types, setTypes] = useState(null);
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
      if (plugins[key].info.disabled || !plugins[key].info.healthy) return;
      const updatedPlugins = { ...plugins };
      const plugin = { ...updatedPlugins[key] };
      plugin.isSet = !plugin.isSet;
      updatedPlugins[key] = plugin;
      saveSetting(key, plugin.isSet);
      setPlugins(updatedPlugins);
    },
    [plugins]
  );

  const setArgument = useCallback(
    (pluginKey, argumentKey, v) => {
      const updatedPlugins = { ...plugins };
      updatedPlugins[pluginKey].arguments[argumentKey] = v;
      setPlugins(updatedPlugins);
    },
    [plugins]
  );

  return { retry, error, plugins, types, loading, toggle, setArgument };
};

export { usePlugins };
