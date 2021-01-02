import { useCallback, useMemo, useReducer, useRef } from "react";

const useList = (initialList = []) => {
  const id = useRef(0);
  const initialState = useMemo(
    () => Object.fromEntries(initialList.map((element) => [id.current++, element])),
    [initialList]
  );
  const [elements, elementsReducer] = useReducer((state, action) => {
    let newElements;
    let element;
    let elementID;
    switch (action.type) {
      case "ADD":
        element = action.payload;
        return { ...state, [id.current++]: element };
      case "REMOVE":
        elementID = action.payload;
        newElements = { ...state };
        delete newElements[elementID];
        return newElements;
      case "ALTER":
        [elementID, element] = action.payload;
        return { ...state, [elementID]: element };
      default:
        return state;
    }
  }, initialState);

  const addElement = useCallback((element) => elementsReducer({ type: "ADD", payload: element }), [
    elementsReducer,
  ]);
  const removeElement = useCallback(
    (elementID) => {
      elementsReducer({ type: "REMOVE", payload: elementID });
    },
    [elementsReducer]
  );
  const alterElement = useCallback(
    (elementID, element) => {
      elementsReducer({ type: "ALTER", payload: [elementID, element] });
    },
    [elementsReducer]
  );

  return [elements, addElement, removeElement, alterElement];
};

export { useList };
