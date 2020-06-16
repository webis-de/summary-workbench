import React from "react";
import Badge from "react-bootstrap/Badge";

const MetricBadge = ({ metric, isComputed }) => (
  <Badge
    key={metric}
    className="mx-1 my-2 mb-1"
    variant={isComputed ? "primary" : "secondary"}
    pill
  >
    {metric}
  </Badge>
);

const MetricBadges = ({ allMetrics, computedMetrics }) => (
  <div>
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
