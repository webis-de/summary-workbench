import React, { useContext, useMemo } from "react";
import { FaCogs } from "react-icons/fa";

import { SettingsContext } from "../contexts/SettingsContext";
import { Section } from "./utils/Section";
import { SettingCheckboxes } from "./utils/SettingCheckboxes";

const filterSettingsType = (settings, type) =>
  Object.fromEntries(Object.entries(settings).filter(([key, value]) => value.type == type));

const Settings = () => {
  const { settings, toggleSetting } = useContext(SettingsContext);

  const lexicalSettings = filterSettingsType(settings, "lexical");
  const semanticSettings = filterSettingsType(settings, "semantic");

  return (
    <Section
      title={
        <div>
          <p className="card-title">
            <FaCogs /> Choose Metrics
          </p>
        </div>
      }
    >
      <div className="uk-flex">
        <div style={{ flex: "1", marginTop: "-25px" }} className="uk-margin-right">
          <h4 className="underline-border uk-text-left colored-header ">Lexical</h4>
          <SettingCheckboxes settings={lexicalSettings} toggleSetting={toggleSetting} />
        </div>
        <div style={{ flex: "1", marginTop: "-25px" }}>
          <h4 className="underline-border uk-text-left colored-header">Semantic</h4>
          <SettingCheckboxes settings={semanticSettings} toggleSetting={toggleSetting} />
        </div>
      </div>
    </Section>
  );
};

export { Settings };
