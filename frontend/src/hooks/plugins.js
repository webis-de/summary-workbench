import Ajv from "ajv";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAsyncRetry } from "react-use";

import { getChosen } from "../utils/common";

const ajv = new Ajv({
  strict: false,
  coerceTypes: true,
  allErrors: true,
  validateSchema: true,
});

const parseErrorSchema = (ajvErrors) =>
  ajvErrors
    .map((error) =>
      error.keyword === "required"
        ? { ...error, instancePath: `/${error.params.missingProperty}` }
        : error
    )
    .reduce((previous, error) => {
      const path = error.instancePath.substring(1).replace(/\//g, ".");
      const prev = {...previous}
      if (!prev[path]) {
        prev[path] = {
          message: error.message,
          type: error.keyword,
        };
      }
      return prev;
    }, {});

const saveSetting = (key, status) => window.localStorage.setItem(key, status ? "true" : "false");

const loadSetting = (key, defaults) => {
  const setting = window.localStorage.getItem(key);
  if (setting === null && defaults.includes(key)) return true;
  return setting === "true";
};

const convertErrors = (errors) => {
  if (!errors || !Object.keys(errors).length) return null;
  return Object.entries(errors).map(([name, message]) => ({ name, message }));
};

const defaultArguments = (schema) =>
  Object.fromEntries(
    Object.entries(schema.properties).map(([key, value]) => [key, value.default !== undefined ? value.default : ""])
  );

const initPlugins = async (fetchFunction, defaults) => {
  const rawPlugins = await fetchFunction();
  if (!rawPlugins) return null;
  const plugins = {};
  Object.entries(rawPlugins).forEach(([key, value]) => {
    const loaded = !value.disabled && value.healthy;
    const isSet = loadSetting(key, defaults) && loaded;
    const info = value;
    if (!info.metadata.type) info.metadata.type = "unknown";
    const data = { info, isSet };
    if (loaded) {
      const schema = info.validators.argument;
      const val = ajv.compile(schema);
      const validate = (values) => {
        val(values)
        return parseErrorSchema(val.errors || [])
      }
      data.arguments = defaultArguments(schema);
      data.validate = validate;
      data.errors = validate(data.arguments)
    }
    plugins[key] = data;
  });
  return plugins;
};

const extractArgumentErrors = (chosenModels) =>
  Object.values(chosenModels)
    .map(({info: {name}, errors}) => ({
        name,
        message: convertErrors(errors),
    }))
    .filter(({ message }) => message)
    .sort(({ name }) => name);

const usePlugins = (fetchFunction, defaults) => {
  const { value, loading, retry, error } = useAsyncRetry(() =>
    initPlugins(fetchFunction, defaults)
  );
  const [plugins, setPlugins] = useState({});

  useEffect(() => {
    setPlugins(value);
  }, [value, setPlugins]);

  const toggle = useCallback(
    (key) => {
      const { disabled, healthy } = plugins[key].info;
      if (disabled || !healthy) return;
      const plugin = { ...plugins[key] };
      plugin.isSet = !plugin.isSet;
      saveSetting(key, plugin.isSet);
      setPlugins({ ...plugins, [key]: plugin });
    },
    [plugins, setPlugins]
  );

  const setArgument = useCallback(
    (key, argKey, v) => {
      const plugin = plugins[key];
      const { arguments: args, validate } = plugin;
      const updatedPlugins = { ...plugins };
      const data = { ...args, [argKey]: v };
      const errors = validate(data);
      updatedPlugins[key].arguments = data;
      updatedPlugins[key].errors = errors;
      setPlugins(updatedPlugins);
    },
    [plugins, setPlugins]
  );

  const types = useMemo(
    () => plugins && [...new Set(Object.values(plugins).map(({ info }) => info.metadata.type))],
    [plugins]
  );
  const chosenModels = useMemo(() => (plugins ? getChosen(plugins) : {}), [plugins]);
  const argumentErrors = useMemo(
    () => extractArgumentErrors(chosenModels),
    [chosenModels]
  );

  return {
    retry,
    error,
    loading,
    plugins,
    types,
    chosenModels,
    argumentErrors,
    toggle,
    setArgument,
  };
};

export { usePlugins };
