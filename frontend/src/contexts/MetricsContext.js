import React from "react";

import { useMetrics } from "../hooks/metrics";

const MetricsContext = React.createContext();

const MetricsProvider = ({ children }) => {
  const metrics = useMetrics();
  return <MetricsContext.Provider value={metrics}>{children}</MetricsContext.Provider>;
};
export { MetricsContext, MetricsProvider };
