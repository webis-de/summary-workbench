import "react-tooltip/dist/react-tooltip.css";

import { useId } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

const Tooltip = ({ place = "left", text, children }) => {
  const id = useId();
  return (
    <div>
      <div id={id} data-tooltip-content={text}>
        {children}
      </div>
      <ReactTooltip
        anchorId={id}
        place={place}
        style={{ backgroundColor: "#656565", maxWidth: "400px", padding: "2px 6px", opacity: 1 }}
      />
    </div>
  );
};

export { Tooltip };
