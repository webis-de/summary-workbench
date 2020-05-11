import React, { useState } from "react";

const CalculateContext = React.createContext();

const CalculateProvider = ({ children }) => {
  const [calculateResult, setCalculateResult] = useState(null);

  return (
    <CalculateContext.Provider value={{ calculateResult, setCalculateResult }}>
      {children}
    </CalculateContext.Provider>
  );
};

export { CalculateContext, CalculateProvider };
