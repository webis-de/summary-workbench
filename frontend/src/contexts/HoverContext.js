import React, { useState } from "react";

const HoverContext = React.createContext();

const HoverProvider = ({ children }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <HoverContext.Provider value={hovered}>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {children}
      </div>
    </HoverContext.Provider>
  );
};

export { HoverContext, HoverProvider };
