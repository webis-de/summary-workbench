import React from "react";

const SettingCheckbox = ({ metric, is_set, readable, onClick }) => (
  <label className="uk-padding-small">
    <input
      className="uk-checkbox uk-margin-small-right"
      checked={is_set}
      readOnly={true}
      onClick={onClick}
      type="checkbox"
    />
    {readable}
  </label>
);

const SettingCheckboxes = ({ className, settings, toggleSetting }) => (
  <div className=" uk-grid uk-flex uk-flex-between uk-padding-remove" datatype="uk-grid">
    {Object.entries(settings).map(([metric, { is_set, readable }]) => (
      <SettingCheckbox
        key={metric}
        metric={metric}
        is_set={is_set}
        readable={readable}
        onClick={() => toggleSetting(metric)}
      />
    ))}
  </div>
);

export { SettingCheckboxes };
