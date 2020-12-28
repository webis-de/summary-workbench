import React, { useState } from "react";
import { FaInfoCircle, FaTrash } from "react-icons/fa";
import {
  MdSentimentDissatisfied,
  MdSentimentNeutral,
  MdSentimentSatisfied,
  MdSentimentVeryDissatisfied,
  MdSentimentVerySatisfied,
} from "react-icons/md";

import { useKeycode } from "../hooks/keycode";
import { useList } from "../hooks/list";
import { Button } from "./utils/Button";
import { ChooseFile, sameLength, useFile } from "./utils/ChooseFile";
import { DeleteButton } from "./utils/DeleteButton";
import { Modal } from "./utils/Modal";

const ModelModal = ({ isOpen, setIsOpen, models, addModel, otherLines }) => {
  const [name, setName] = useState("");
  const [infoText, setInfoText] = useState(null);
  const [fileName, setFile, lines] = useFile(null);
  const linesAreSame = sameLength([lines, ...otherLines]);

  const close = () => {
    setIsOpen(false);
  };
  const modelIsValid = () => {
    return !Object.values(models).some((model) => model.name === name);
  };
  const accept = () => {
    if (!name) {
      setInfoText("no name given");
      return;
    }
    if (fileName === null) {
      setInfoText("no file given");
      return;
    }
    if (modelIsValid()) {
      addModel({ name, lines });
      close();
    } else {
      setInfoText(`name '${name}' is already taken`);
    }
  };
  useKeycode([13], accept, isOpen);

  return (
    <Modal isOpen={isOpen} onRequestClose={close}>
      <input
        className="uk-input"
        type="text"
        value={name}
        placeholder="name"
        autoFocus
        onChange={(e) => setName(e.target.value)}
      />
      <ChooseFile
        className="uk-margin-top"
        kind="Model"
        name="Model"
        fileName={fileName}
        setFile={setFile}
        lines={lines}
        linesAreSame={linesAreSame}
      />
      {infoText && (
        <div className="uk-margin-top uk-text-primary">
          <FaInfoCircle /> {infoText}
        </div>
      )}
      <div className="uk-margin" style={{ float: "right" }}>
        <button className="uk-button uk-button-secondary" onClick={close}>
          cancel
        </button>
        <button className="uk-button uk-button-primary" onClick={accept}>
          add
        </button>
      </div>
    </Modal>
  );
};

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

const optionTypes = ["checkboxes", "radio buttons"];

const AnnotationDesigner = ({ type, options, addOption, removeOption, alterOption }) => {
  if (optionTypes.includes(type)) {
    return (
      <div className="uk-margin-top">
        <Button onClick={() => addOption("")}>Add Option</Button>
        {Object.entries(options).map(([key]) => (
          <div key={key} className="uk-flex uk-margin-top">
            <input
              className="uk-input"
              onChange={(e) => alterOption(key, e.target.value)}
              placeholder="option value"
            />
            <DeleteButton onClick={() => removeOption(key)} />
          </div>
        ))}
      </div>
    );
  }
  return null;
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

const annotationTypes = {
  "short text": ShortText,
  "likert scale": LikertScale,
  checkboxes: Checkboxes,
  "radio buttons": RadioButtons,
};

const getAnnotation = (type, options) => {
  const Type = annotationTypes[type];
  return <Type setValue={() => {}} options={options} />;
};

const Annotation = ({ question, type, options }) => {
  return (
    <>
      <div
        style={{
          whiteSpace: "pre-wrap",
          minHeight: "1.25em",
          lineHeight: "1.25",
          marginBottom: "10px",
        }}
      >
        {question}
      </div>
      <div className="uk-flex uk-flex-center">{getAnnotation(type, options)}</div>
    </>
  );
};
const AnnotationPreview = ({ question, type, options }) => (
  <fieldset
    className="uk-margin-top uk-padding-small"
    style={{ border: "1px solid", borderRadius: "3px" }}
  >
    <legend>Preview</legend>
    <Annotation question={question} type={type} options={options} />
  </fieldset>
);

const answerTypes = ["short text", "likert scale", "checkboxes", "radio buttons"];

const AnnotationModal = ({ isOpen, setIsOpen, addAnnotation }) => {
  const [question, setQuestion] = useState("");
  const [infoText, setInfoText] = useState(null);
  const [options, addOption, removeOption, alterOption] = useList();
  const [type, setType] = useState("");

  const close = () => {
    setIsOpen(false);
  };

  const accept = () => {
    if (!question) {
      setInfoText("no question given");
      return;
    }
    if (!type) {
      setInfoText("no answer type selected");
      return;
    }
    const annotation = { question, type };
    if (optionTypes.includes(type)) {
      annotation.options = options;
    }
    addAnnotation(annotation);
    close();
  };
  useKeycode([13], accept, isOpen);

  return (
    <Modal isOpen={isOpen} onRequestClose={close}>
      <input
        className="uk-input"
        type="text"
        value={question}
        placeholder="question"
        autoFocus
        onChange={(e) => setQuestion(e.target.value)}
      />
      <select
        value={type}
        className="uk-select uk-margin-top"
        name="answerType"
        onChange={(e) => setType(e.target.value)}
      >
        <option value="" disabled selected hidden>
          answer type
        </option>
        {answerTypes.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {Boolean(type) && (
        <>
          <AnnotationDesigner
            type={type}
            options={options}
            addOption={addOption}
            removeOption={removeOption}
            alterOption={alterOption}
          />
          <AnnotationPreview question={question} type={type} options={options} />
        </>
      )}
      {infoText && (
        <div className="uk-margin-top uk-text-primary">
          <FaInfoCircle /> {infoText}
        </div>
      )}
      <div className="uk-margin" style={{ float: "right" }}>
        <button className="uk-button uk-button-secondary" onClick={close}>
          cancel
        </button>
        <button className="uk-button uk-button-primary" onClick={accept}>
          add
        </button>
      </div>
    </Modal>
  );
};

const ModelTable = ({ models, linesAreSame, removeModel }) => (
  <table className="uk-table uk-table-divider uk-table-small uk-table-middle">
    <thead>
      <tr>
        <th>name</th>
        <th>lines</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(models).map(([key, model]) => (
        <tr key={key} style={{ position: "relative" }}>
          <td>{model.name}</td>
          <td>
            <span
              style={{
                padding: "5px 10px",
                background: !linesAreSame ? "#f0506e" : null,
              }}
            >
              {model.lines.length}
            </span>
          </td>
          <td
            style={{
              position: "absolute",
              top: "50%",
              transform: "translate(-100%, -50%)",
            }}
          >
            <DeleteButton onClick={() => removeModel(key)}>
              <FaTrash />
            </DeleteButton>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const AnnotationTable = ({ annotations, removeAnnotation }) => (
  <div className="uk-accordion-content">
    <ul data-uk-accordion="toggle: > * > .uk-accordion-title;">
      {Object.entries(annotations).map(([key, { question, type, options }]) => (
        <li
          key={key}
          style={{
            border: "1px",
            borderColor: "grey",
            borderStyle: "solid",
          }}
        >
          <div className="uk-flex uk-flex-middle">
            <a
              title={question}
              className="uk-accordion-title uk-flex uk-flex-between uk-text-small uk-width-expand uk-padding-small"
              href="/#"
            >
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {question}
              </span>
              <div>
                <span className="uk-badge uk-padding-small">{type}</span>
              </div>
            </a>
            <DeleteButton
              onClick={() => removeAnnotation(key)}
              className="uk-margin-right"
              style={{ marginLeft: "10%" }}
            />
          </div>
          <div className="uk-padding-small uk-accordion-content" style={{ margin: 0 }}>
            <AnnotationPreview question={question} type={type} options={options} />
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const Visualize = () => {
  const [modelModalIsOpen, setModelModalOpen] = useState(false);
  const [annotationModalIsOpen, setAnnotationModalOpen] = useState(false);

  const [docFileName, setDocFile, docFileLines] = useFile(null);
  const [refFileName, setRefFile, refFileLines] = useFile(null);

  const [models, addModel, removeModel] = useList();
  const allLines = [refFileLines, docFileLines, ...Object.values(models).map(({ lines }) => lines)];
  const atLeastOneModel = Boolean(Object.keys(models).length)
  const linesAreSame = sameLength(allLines);
  const [annotations, addAnnotation, removeAnnotation] = useList();

  return (
    <div className="uk-container">
      <div className="uk-flex">
        <div className="uk-flex-column" style={{ display: "inline-flex", minWidth: "300px" }}>
          <ChooseFile
            className="uk-margin-small"
            kind="Documents"
            name="Documents"
            fileName={docFileName}
            setFile={setDocFile}
            lines={docFileLines}
            linesAreSame={linesAreSame}
          />

          <ChooseFile
            className="uk-margin-small"
            kind="References"
            name="References"
            fileName={refFileName}
            setFile={setRefFile}
            lines={refFileLines}
            linesAreSame={linesAreSame}
          />
          {docFileName !== null && refFileName !== null && (
            <>
              <button
                className="uk-button uk-button-primary uk-margin-small"
                onClick={() => setModelModalOpen(true)}
              >
                Add Model
              </button>

              <button
                className="uk-button uk-button-primary uk-margin-small"
                onClick={() => setAnnotationModalOpen(true)}
              >
                Add Annotation
              </button>

              <button
                className="uk-button uk-button-primary uk-margin-small"
                onClick={() => console.log("save")}
                disabled={!atLeastOneModel || !linesAreSame}
                data-uk-tooltip={
                  atLeastOneModel ? (linesAreSame ? null : "title: not all lines are same; pos: right;") : "title: add at least one model; pos: right;"
                }
              >
                Save
              </button>
            </>
          )}
        </div>

        <>
          <div style={{ width: "20px" }} />
          <div className="uk-flex-column" style={{ flexGrow: 1 }}>
            <ul
              className="uk-tab dark-tab uk-margin"
              data-uk-tab
              uk-tab="connect: #visualization-options;"
            >
              <li>
                <a href="/#">Models</a>
              </li>
              <li>
                <a href="/#">Annotations</a>
              </li>
            </ul>
            <ul id="visualization-options" className="uk-switcher">
              <li>
                <ModelTable models={models} linesAreSame={linesAreSame} removeModel={removeModel} />
              </li>
              <li>
                <AnnotationTable annotations={annotations} removeAnnotation={removeAnnotation} />
              </li>
            </ul>
          </div>
        </>
      </div>

      {modelModalIsOpen && (
        <ModelModal
          isOpen={modelModalIsOpen}
          models={models}
          addModel={addModel}
          setIsOpen={setModelModalOpen}
          otherLines={allLines}
        />
      )}
      {annotationModalIsOpen && (
        <AnnotationModal
          isOpen={annotationModalIsOpen}
          setIsOpen={setAnnotationModalOpen}
          addAnnotation={addAnnotation}
        />
      )}
    </div>
  );
};

export { Visualize };
