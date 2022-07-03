import ReactTooltip from "react-tooltip";

const Tooltip = ({ place = "left", text, children }) => (
  <div>
    <div data-tip={text}>{children}</div>
    <ReactTooltip place={place} effect="solid" backgroundColor="#656565" className="tooltip max-w-[400px]" />
  </div>
);

export { Tooltip };
