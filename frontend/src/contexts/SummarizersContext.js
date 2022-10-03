import React from "react";

import { getSummarizersRequest } from "../api";
import { usePlugins } from "../hooks/plugins";

const defaults = ["summarizer-null-textrank", "summarizer-null-bartcnn"];

const SummarizersContext = React.createContext();

const SummarizersProvider = ({ children }) => {
  const summarizers = usePlugins(getSummarizersRequest, defaults);
  return <SummarizersContext.Provider value={summarizers}>{children}</SummarizersContext.Provider>;
};
export { SummarizersContext, SummarizersProvider };
