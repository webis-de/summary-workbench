import React, { useMemo, useReducer } from "react";

import { settings as baseSettings } from "../common/settings";

const SettingsContext = React.createContext();

const saveSetting = (metric, status) => window.localStorage.setItem(metric, JSON.stringify(status === true));
const loadSetting = metric => JSON.parse(window.localStorage.getItem(metric)) === true;

const toggleSettingReducer = (settings, metric) => {
  const newSettings = Object.assign({}, settings);
  const is_set = !newSettings[metric].is_set;
  newSettings[metric].is_set = is_set
  saveSetting(metric, is_set)
  return newSettings;
};

const SettingsProvider = ({ children }) => {
  const defaultSettings = useMemo(() =>
    Object.fromEntries(
      Object.entries(baseSettings).map(([metric, info]) => {
        info.is_set = loadSetting(metric);
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
