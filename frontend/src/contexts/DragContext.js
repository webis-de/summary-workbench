import React, { useEffect, useState } from "react";

const DragContext = React.createContext();

const DragProvider = ({ children }) => {
  const [numDragged, setNumDragged] = useState(0);
  const [dragged, setDragged] = useState(false);
  const increment = () => setNumDragged((v) => v + 1);
  const decrement = () => setNumDragged((v) => v - 1);
  useEffect(() => {
    setDragged(numDragged > 0);
  }, [numDragged, setDragged]);

  return (
    <DragContext.Provider value={dragged}>
      <div onDragEnter={increment} onDragLeave={decrement} onDrop={decrement}>
        {children}
      </div>
    </DragContext.Provider>
  );
};

export { DragContext, DragProvider };
