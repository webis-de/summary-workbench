import React, { useContext } from "react";
import { FaCogs } from "react-icons/fa";

import { metrics } from "../config";
import { SettingsContext } from "../contexts/SettingsContext";
import { Card } from "./utils/Card";
import { SettingCheckboxes } from "./utils/SettingCheckboxes";

const initMetrics = (models) => {
  const types = {};
  Object.entries(models).forEach(([key, value]) => {
    const { type } = value;
    if (types[type]) types[type].push(key);
    else types[type] = [key];
  });
  return types;
};

const metricTypes = initMetrics(metrics);

const Settings = () => {
  const { settings, toggleSetting } = useContext(SettingsContext);

  return (
    <Card
      title={
        <div>
          <p className="card-title">
            <FaCogs /> Choose Metrics
          </p>
        </div>
      }
    >
      <div className="uk-flex" style={{ marginTop: "-25px" }}>
        {Object.keys(metricTypes).length ? (
          Object.entries(metricTypes).map(([key, value]) => (
            <div key={key} style={{ flex: "1" }} className="margin-right">
              <h4
                className="underline-border uk-text-left colored-header"
                style={{ textTransform: "capitalize" }}
              >
                {key}
              </h4>
              <SettingCheckboxes
                settings={settings}
                subsettings={value}
                toggleSetting={toggleSetting}
              />
            </div>
          ))
        ) : (
          <div>no metrics configured</div>
        )}
      </div>
    </Card>
  );
};

export { Settings };
