import React, { useState } from "react";
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

const LikertScale = ({ setValue }) => {
  const [selected, setSelected] = useState(null);
  const selectValue = (value) => () => {
    setSelected(value);
    setValue(value);
  };
  return (
    <div className="uk-flex" style={{ height: "50px" }}>
      {likertFaces.map(([number, Face]) => (
        <Face
          key={number}
          className="margin-right"
          style={getFaceStyle(number === selected)}
          onClick={selectValue(number)}
        />
      ))}
    </div>
  );
};

const ShortText = ({ setValue }) => (
  <textarea
    className="uk-textarea"
    onChange={(e) => setValue(e.target.value)}
    rows="3"
    style={{ resize: "none", overflow: "auto" }}
  />
);

const Checkboxes = ({ setValue, options }) => (
  <div className="uk-flex uk-flex-wrap">
    {Object.entries(options).map(([key, option]) => (
      <label key={key} className="margin-right" style={{ whitespace: "nowrap" }}>
        <input
          onChange={(e) => setValue(e.target.value)}
          className="uk-checkbox"
          type="checkbox"
          value={option}
          style={{ marginRight: "10px" }}
        />
        {option}
      </label>
    ))}
  </div>
);

const RadioButtons = ({ setValue, options }) => {
  const [checkedId, setCheckedId] = useState(null);
  return (
    <div>
      {Object.entries(options).map(([key, option]) => (
        <label className="margin-right" key={key} style={{ whitespace: "nowrap" }}>
          <input
            onChange={(e) => {
              setCheckedId(key);
              setValue(e.target.value);
            }}
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
