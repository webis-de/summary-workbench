import React, { useMemo, useReducer } from "react";

import { settings as baseSettings } from "../config";

const SettingsContext = React.createContext();

const saveSetting = (metric, status) => window.localStorage.setItem(metric, JSON.stringify(status === true));
const loadSetting = metric => JSON.parse(window.localStorage.getItem(metric)) === true;

const toggleSettingReducer = (settings, metric) => {
  const newSettings = Object.assign({}, settings);
  const isSet = !newSettings[metric].isSet;
  newSettings[metric].isSet = isSet
  saveSetting(metric, isSet)
  return newSettings;
};

const SettingsProvider = ({ children }) => {
  const defaultSettings = useMemo(() =>
    Object.fromEntries(
      Object.entries(baseSettings).map(([metric, info]) => {
        info.isSet = loadSetting(metric);
        return [metric, info];
      })
    )
  , []);

  const [settings, toggleSetting] = useReducer(toggleSettingReducer, defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, toggleSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext, SettingsProvider };
