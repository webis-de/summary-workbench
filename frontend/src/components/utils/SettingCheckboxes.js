import React from "react";

const SettingCheckbox = ({ isSet, readable, onClick }) => (
  <label className="uk-padding-small" style={{ whiteSpace: "nowrap" }}>
    <input
      className="uk-checkbox uk-margin-small-right"
      checked={isSet}
      readOnly
      onClick={onClick}
      type="checkbox"
    />
    <span style={{ whiteSpace: "nowrap" }}>{readable}</span>
  </label>
);

const SettingCheckboxes = ({ settings, subsettings, toggleSetting }) => (
  <div className="uk-flex uk-flex-column">
    {subsettings.map((metric) => (
      <SettingCheckbox
        key={metric}
        metric={metric}
        isSet={settings[metric].isSet}
        readable={settings[metric].readable}
        onClick={() => toggleSetting(metric)}
      />
    ))}
  </div>
);

export { SettingCheckboxes };
