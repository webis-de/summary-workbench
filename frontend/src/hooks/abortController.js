import { useCallback, useEffect, useState } from "react";

const useAbortController = () => {
  const [abortController, setAbortController] = useState(null);

  useEffect(
    () => () => {
      if (abortController) abortController.abort();
    },
    [abortController]
  );

  const reset = useCallback(() => {
    const controller = new AbortController();
    setAbortController(controller);
    return controller;
  }, [setAbortController]);
  const abort = useCallback(() => abortController.abort(), [abortController]);

  return { abortController, reset, abort };
};

export { useAbortController };
