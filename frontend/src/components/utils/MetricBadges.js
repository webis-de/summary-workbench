import React from "react";

const MetricBadge = ({ metric, isComputed }) => (
  <span
    key={metric}
    className={"uk-badge uk-text-bold uk-text-muted uk-padding-small uk-margin-small-left " + (isComputed ? "uk-background-primary uk-text-emphasis" : "uk-background-default uk-text-muted")}
  >
    {metric}
  </span>
);

const MetricBadges = ({ allMetrics, computedMetrics }) => (
  <div className="uk-flex uk-flex-wrap" style={{gridRowGap: "10px"}}>
    {allMetrics.map(([metric, readable]) => (
      <MetricBadge
        key={metric}
        metric={readable}
        isComputed={computedMetrics.includes(metric)}
      />
    ))}
  </div>
);

export { MetricBadges };
