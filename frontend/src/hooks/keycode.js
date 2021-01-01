import { useEffect } from "react";

const useKeycode = (keycodes, callback, condition = true) => {
  useEffect(() => {
    if (condition) {
      const listener = (e) => {
        if (keycodes.includes(e.keyCode)) {
          e.preventDefault();
          callback(e.keyCode);
        }
      };
      window.addEventListener("keydown", listener);
      return () => window.removeEventListener("keydown", listener);
    }
    return null;
  }, [keycodes, callback, condition]);
};

export { useKeycode };
