import React, { useContext } from "react";
import { FaCogs } from "react-icons/fa";

import { SettingsContext } from "../contexts/SettingsContext";
import { SettingButtons } from "./utils/SettingButtons";
import { Section } from "./utils/Section";

const Settings = () => {
  const { settings, toggleSetting } = useContext(SettingsContext);

  return (
    <Section>
      <h3><FaCogs /> Choose metrics</h3>
      <SettingButtons
        settings={settings}
        toggleSetting={toggleSetting}
      />
    </Section>
  );
};

export { Settings };
