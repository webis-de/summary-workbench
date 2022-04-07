import React, { useEffect, useState } from "react";

import { Textarea } from "./utils/Form";
import { FlexResponsive } from "./utils/Layout";

const TextField = ({ value, setValue, placeholder }) => (
  <Textarea
    value={value}
    onChange={(e) => setValue(e.currentTarget.value)}
    rows="8"
    placeholder={placeholder}
  />
);

const OneHypRef = ({ setComputeData }) => {
  const [hypText, setHypText] = useState("");
  const [refText, setRefText] = useState("");

  useEffect(() => {
    const errors = [];
    if (!refText) errors.push("reference text is missing");
    if (!hypText) errors.push("hypothesis text is missing");
    if (errors.length) {
      setComputeData({ errors });
      return;
    }
    try {
      setComputeData({
        data: {
          id: "",
          lines: [{ reference: refText, hypothesis: hypText }],
        },
      });
    } catch (error) {
      setComputeData({ errors: [error.message] });
    }
  }, [hypText, refText]);

  return (
    <FlexResponsive>
      <TextField value={refText} setValue={setRefText} placeholder="Enter the reference text." />
      <TextField value={hypText} setValue={setHypText} placeholder="Enter the predicted text." />
    </FlexResponsive>
  );
};

export { OneHypRef };
