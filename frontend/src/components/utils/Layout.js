const FlexResponsive = ({ children }) => (
  <div className="flex gap-4 flex-col md:flex-row lg:flex-col xl:flex-row mb-3">{children}</div>
);

const SpaceGap = ({ children, big }) => (
  <div className={big ? "space-y-4" : "space-y-2"}>{children}</div>
);
const FlexGap = ({ children, big }) => (
  <div className={`flex flex-col ${big ? "gap-4" : "gap-2"}`}>{children}</div>
);

export { FlexResponsive, SpaceGap, FlexGap };
