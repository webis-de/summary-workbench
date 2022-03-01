import React from "react";

import { getMetricsRequest } from "../api";
import { usePlugins } from "../hooks/plugins";

const defaults = ["anonymous-rouge"];

const MetricsContext = React.createContext();

const MetricsProvider = ({ children }) => {
  const metrics = usePlugins(getMetricsRequest, defaults);
  metrics.metrics = metrics.plugins;
  delete metrics.plugins;
  return <MetricsContext.Provider value={metrics}>{children}</MetricsContext.Provider>;
};
export { MetricsContext, MetricsProvider };
