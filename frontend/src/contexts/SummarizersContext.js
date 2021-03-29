import React from "react";

import { useSummarizers } from "../hooks/summarizers";

const SummarizersContext = React.createContext();

const SummarizersProvider = ({ children }) => {
  const summarizers = useSummarizers();
  return <SummarizersContext.Provider value={summarizers}>{children}</SummarizersContext.Provider>;
};
export { SummarizersContext, SummarizersProvider };
