import React from "react";
import {Button} from "./Button"

const SettingButton = ({ metric, is_set, readable, onClick }) => (
  <Button
    variant={is_set ? "primary" : "default"}
    size="medium"
    onClick={onClick}
  >
    {readable}
  </Button>
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
