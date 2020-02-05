import React, { useState } from "react";
import Upload from "./Upload";
import Result from "./Result";

const Calculation = ({ className }) => {
  const [resultKey, setResultKey] = useState(false)
  const reloadResult = () => {
    setResultKey(!resultKey)
  }
  return (
    <>
      <Upload className={className} reloadResult={reloadResult} />
      <Result key={resultKey} className={className} />
    </>
  );
};

export default Calculation;
