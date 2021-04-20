import React, { useEffect, useReducer, useState } from "react";
import {
  MdSentimentDissatisfied,
  MdSentimentNeutral,
  MdSentimentSatisfied,
  MdSentimentVeryDissatisfied,
  MdSentimentVerySatisfied,
} from "react-icons/md";

const getFaceStyle = (isSelected) => ({
  height: "inherit",
  width: "auto",
  color: isSelected ? "#FF0" : "#000",
  backgroundColor: isSelected ? "#000" : null,
  borderRadius: "100px",
});

const likertFaces = [
  [1, MdSentimentVeryDissatisfied],
  [2, MdSentimentDissatisfied],
  [3, MdSentimentNeutral],
  [4, MdSentimentSatisfied],
  [5, MdSentimentVerySatisfied],
];

const useOnChange = (initValue, onChange, reducer) => {
  const [isInput, setIsInput] = useState(false);
  const [state, setState] = useReducer((oldState, newState) => {
    setIsInput(true);
    if (reducer) return reducer(oldState, newState);
    return newState;
  }, initValue);
  useEffect(() => {
    if (isInput && onChange) onChange(state);
    setIsInput(false);
  }, [isInput, onChange, state]);
  return [state, setState];
};

const LikertScale = ({ annotation, onChange }) => {
  const [selected, setSelected] = useOnChange(
    annotation !== undefined ? annotation : null,
    onChange
  );
  return (
    <div className="uk-flex" style={{ height: "50px" }}>
      {likertFaces.map(([number, Face]) => (
        <Face
          key={number}
          className="margin-right"
          style={getFaceStyle(number === selected)}
          onClick={() => setSelected(number)}
        />
      ))}
    </div>
  );
};

const ShortText = ({ annotation, onChange }) => {
  const [text, setText] = useOnChange(annotation || "", onChange);
  return (
    <textarea
      className="uk-textarea"
      value={text}
      onChange={(e) => setText(e.currentTarget.value)}
      rows="3"
      style={{ resize: "none", overflow: "auto" }}
    />
  );
};

const Checkboxes = ({ annotation, options, onChange }) => {
  const [selectedOptions, toggleOption] = useOnChange(
    annotation || [],
    onChange,
    (oldState, newOption) => {
      const newState = [...oldState];
      if (oldState.includes(newOption)) return oldState.filter((option) => option !== newOption);
      newState.push(newOption);
      return newState;
    }
  );
  return (
    <div className="uk-flex uk-flex-wrap">
      {Object.entries(options).map(([key, option]) => (
        <label key={key} className="margin-right" style={{ whitespace: "nowrap" }}>
          <input
            onChange={() => toggleOption(key)}
            className="uk-checkbox"
            type="checkbox"
            checked={selectedOptions.includes(key)}
            value={option}
            style={{ marginRight: "10px" }}
          />
          {option}
        </label>
      ))}
    </div>
  );
};

const RadioButtons = ({ annotation, options, onChange }) => {
  const [checkedId, setCheckedId] = useOnChange(
    annotation !== undefined ? annotation : null,
    onChange
  );
  return (
    <div>
      {Object.entries(options).map(([key, option]) => (
        <label className="margin-right" key={key} style={{ whitespace: "nowrap" }}>
          <input
            onChange={() => setCheckedId(key)}
            checked={checkedId === key}
            className="uk-radio"
            type="radio"
            value={option}
            style={{ marginRight: "10px" }}
          />
          {option}
        </label>
      ))}
    </div>
  );
};

export { LikertScale, ShortText, RadioButtons, Checkboxes };
