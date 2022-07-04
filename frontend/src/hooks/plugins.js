import { useCallback, useEffect, useState } from "react";
import { MdSwitchLeft } from "react-icons/md";
import { useAsyncRetry } from "react-use";

const saveSetting = (key, status) => window.localStorage.setItem(key, status ? "true" : "false");

const loadSetting = (key, defaults) => {
  const setting = window.localStorage.getItem(key);
  if (setting === null && defaults.includes(key)) return true;
  return setting === "true";
};

const argumentToDefault = ({ type, default: def }) => {
  if (def !== undefined && def !== null) return def;
  switch (type) {
    case "str":
      return undefined;
    case "int":
      return undefined;
    case "float":
      return undefined;
    case "categorical":
      return undefined;
    case "bool":
      return false;
    default:
      throw new Error(`unknown type ${type}`);
  }
};

const initPlugins = async (fetchFunction, defaults) => {
  const rawPlugins = await fetchFunction();
  if (!rawPlugins) return null;
  const plugins = {};
  Object.entries(rawPlugins).forEach(([key, value]) => {
    const isSet = loadSetting(key, defaults) && !value.disabled && value.healthy;
    let args = value.arguments || {};
    if (value.arguments) {
      args = Object.fromEntries(
        Object.entries(value.arguments).map(([argName, argDef]) => [
          argName,
          argumentToDefault(argDef),
        ])
      );
    }
    const info = { ...value };
    if (!info.metadata.type) info.metadata.type = "unknown";
    plugins[key] = { info, isSet, arguments: args };
  });
  const types = [...new Set(Object.values(plugins).map(({ info }) => info.metadata.type))];
  return { plugins, types };
};

const parse = (value, parseFunc, min, max) => {
  if (value === "" || value === undefined) return undefined;
  let parsed = parseFunc(value);
  if (Number.isNaN(parsed)) parsed = 0;
  if (min !== undefined && parsed < min) parsed = min;
  if (max !== undefined && parsed > max) parsed = max;
  return parsed;
};
const verifyArg = (value, type, definition) => {
  const { min, max, categories } = definition;
  switch (type) {
    case "int":
      return parse(value, parseInt, min, max);
    case "float":
      return parse(value, parseFloat, min, max);
    case "str":
      return (value || "").trim() || undefined;
    case "categorical":
      return categories.includes(value) ? value : undefined;
    case "bool":
      return value === true;
    default:
      throw new Error(`unknown type ${type}`);
  }
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
    (pluginKey, argumentKey, newValue) => {
      let v = newValue;
      const {
        default: defaultArg,
        type,
        ...definition
      } = plugins[pluginKey].info.arguments[argumentKey];
      const updatedPlugins = { ...plugins };
      v = verifyArg(v, type, definition);
      if (v === null) v = undefined;
      if (v === undefined && defaultArg !== undefined) v = defaultArg;
      if (v === null) v = undefined;
      const args = updatedPlugins[pluginKey].arguments
      updatedPlugins[pluginKey].arguments = {...(args),  [argumentKey]: v};
      setPlugins(updatedPlugins);
    },
    [plugins]
  );

  return { retry, error, plugins, types, loading, toggle, setArgument };
};

export { usePlugins };
