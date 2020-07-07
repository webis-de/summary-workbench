import React from "react";

const SettingButton = ({ metric, is_set, readable, onClick }) => (
  <button
    className={"uk-button uk-button-" + (is_set ? "primary" : "default")}
    onClick={onClick}
  >
    {readable}
  </button>
);

const SettingButtons = ({ className, settings, toggleSetting }) => (
  <div className="uk-flex uk-flex-around uk-flex-wrap" style={{gridRowGap: "10px"}}>
    {Object.entries(settings).map(([metric, { is_set, readable }]) => (
      <SettingButton
        key={metric}
        metric={metric}
        is_set={is_set}
        readable={readable}
        onClick={() => toggleSetting(metric)}
      />
    ))}
  </div>
);

export { SettingButtons };
