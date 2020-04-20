import React, { useReducer, useMemo } from "react";
import { settings as baseSettingsInfo } from "../common/settings";

const SettingsContext = React.createContext();

const toggleSettingReducer = (settings, metric) => {
  const newSettings = Object.assign({}, settings);
  const is_set = !newSettings[metric].is_set;
  newSettings[metric].is_set = is_set;
  window.localStorage.setItem(metric, JSON.stringify(is_set));
  return newSettings;
};

const SettingsProvider = ({ children }) => {
  const settingsInfo = useMemo(() => {
    const ret = Object.assign({}, baseSettingsInfo);
    Object.keys(baseSettingsInfo).forEach((metric) => {
      const is_set = JSON.parse(window.localStorage.getItem(metric));
      ret[metric].is_set = is_set !== null ? is_set : false
    })
    return ret;
  }, []);

  const [settings, toggleSetting] = useReducer(
    toggleSettingReducer,
    settingsInfo
  );

  return (
    <SettingsContext.Provider value={{ settings, toggleSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext, SettingsProvider };
