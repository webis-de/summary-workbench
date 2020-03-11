import React, { useReducer } from "react";
import { settings as settingsInfo } from "../common/settings";

const SettingsContext = React.createContext();

const toggleSettingReducer = (settings, metric) => {
  const newSettings = Object.assign({}, settings);
  newSettings[metric].is_set = !newSettings[metric].is_set;
  window.localStorage.setItem("settings", JSON.stringify(settings));
  console.log(newSettings)
  return newSettings;
};

const SettingsProvider = ({ children }) => {

  const [settings, toggleSetting] = useReducer(
    toggleSettingReducer,
    JSON.parse(window.localStorage.getItem("settings")) || settingsInfo
  );

  return (
    <SettingsContext.Provider value={{settings, toggleSetting}}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext, SettingsProvider };
