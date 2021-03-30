import React, { useContext } from "react";
import { FaCogs } from "react-icons/fa";

import { MetricsContext } from "../contexts/MetricsContext";
import { Card } from "./utils/Card";
import { Checkboxes } from "./utils/Checkboxes";

const Settings = () => {
  const { metrics, settings, toggleSetting, metricTypes } = useContext(MetricsContext);

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
              <Checkboxes
                options={value.map((metric) => [
                  metric,
                  metrics[metric].readable,
                  settings[metric],
                ])}
                toggleOption={toggleSetting}
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
