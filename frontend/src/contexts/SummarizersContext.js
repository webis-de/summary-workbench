import React from "react";

import { getSummarizersRequest } from "../api";
import { usePlugins } from "../hooks/plugins";

const defaults = ["anonymous-textrank", "anonymous-bart-cnn"];

const SummarizersContext = React.createContext();

const SummarizersProvider = ({ children }) => {
  const summarizers = usePlugins(getSummarizersRequest, defaults);
  summarizers.summarizers = summarizers.plugins;
  delete summarizers.plugins;
  return <SummarizersContext.Provider value={summarizers}>{children}</SummarizersContext.Provider>;
};
export { SummarizersContext, SummarizersProvider };
