import React from "react";

const SettingCheckbox = ({ metric, is_set, readable, onClick }) => (
    <label className="uk-padding-small">
      <input className="uk-checkbox uk-margin-small-right" checked={is_set} onClick={onClick} type="checkbox" />
      {readable}
    </label>
);

const SettingCheckboxes = ({ className, settings, toggleSetting }) => (
  <div className="uk-flex uk-flex-around uk-flex-wrap" style={{ gridRowGap: "10px" }}>
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
