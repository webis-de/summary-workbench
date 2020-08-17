import React, { useContext } from "react";
import { FaCogs } from "react-icons/fa";

import { SettingsContext } from "../contexts/SettingsContext";
import { SettingCheckboxes } from "./utils/SettingCheckboxes";
import { Section } from "./utils/Section";

const Settings = () => {
  const { settings, toggleSetting } = useContext(SettingsContext);

  return (
    <Section
      title={<><FaCogs /> Choose metrics</>}
    >
      <SettingCheckboxes
        settings={settings}
        toggleSetting={toggleSetting}
      />
    </Section>
  );
};

export { Settings };
