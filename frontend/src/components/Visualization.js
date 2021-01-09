import React, { useEffect, useReducer, useRef, useState } from "react";

import { useFile } from "./hooks/File";
import { ChooseFile } from "./utils/ChooseFile";

const Button = ({ onClick, children, style, ...other }) => (
  <button className="uk-button uk-button-primary uk-margin-small" onClick={onClick} {...other}>
    {children}
  </button>
);

const AddModel = ({ style, file, setFile, lines, linesAreSame, addModel }) => {
  const inputRef = useRef();
  return (
    <div
      className="uk-flex uk-flex-column"
      style={{ padding: "10px", border: "1px solid", ...style }}
    >
      <input ref={inputRef} className="uk-input" type="text" placeholder="Name" />
      <ChooseFile
        className="uk-margin-small"
        placeholder="Upload Predictions"
        file={file}
        setFile={setFile}
        lines={lines}
        linesAreSame={linesAreSame}
      />
      <Button onClick={() => addModel([inputRef.current.value, lines, file.name])}>
        Add Model
      </Button>
    </div>
  );
};

const Visualization = () => {
  const [docFile, setDocFile] = useState(null);
  const [refFile, setRefFile] = useState(null);
  const [predFile, setPredFile] = useState(null);
  const [docFileLines] = useFile(docFile);
  const [refFileLines] = useFile(refFile);
  const [predFileLines] = useFile(predFile);
  const [linesAreSame, setLinesAreSame] = useState(null);
  const [models, addModel] = useReducer((oldState, model) => [model, ...oldState], []);
  console.log(models);

  useEffect(() => {
    if (refFileLines !== null && docFileLines !== null) {
      setLinesAreSame(refFileLines === docFileLines);
    } else {
      setLinesAreSame(null);
    }
  }, [refFileLines, docFileLines]);

  return (
    <>
      <div className="uk-container uk-container-expand uk-margin-medium-top@s uk-margin-large-top@l">
        <div className="uk-flex">
          <div style={{ width: "40%" }}>
            <div className="uk-flex uk-flex-column" style={{ display: "inline-flex" }}>
              <ChooseFile
                className="uk-margin-small"
                placeholder="Upload Documents"
                file={docFile}
                setFile={setDocFile}
                lines={docFileLines}
                linesAreSame={linesAreSame}
                style={{ width: "300px" }}
              />

              <ChooseFile
                className="uk-margin-small"
                placeholder="Upload References"
                file={refFile}
                setFile={setRefFile}
                lines={refFileLines}
                linesAreSame={linesAreSame}
              />
              <Button data-uk-toggle="target: #add-model">Add Model</Button>
              {Boolean(models.length) && (
                <>
                  <Button data-uk-toggle="target: #add-model">Add Anotation</Button>
                  <Button>Visualize</Button>
                  <Button>Save</Button>
                </>
              )}
            </div>
          </div>
          <AddModel
            style={{ flexGrow: 1 }}
            file={predFile}
            setFile={setPredFile}
            lines={predFileLines}
            linesAreSame={null}
            addModel={addModel}
          />
        </div>
        {Boolean(models.length) && (
          <table className="uk-table">
            <tbody>
              {models.map((model) => (
                <tr>
                  {model.map((entry) => (
                    <td>{entry}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div id="add-model" data-uk-modal>
        <div className="uk-modal-dialog uk-modal-body">
          <input className="uk-input" type="text" placeholder="Name" />
          <ChooseFile
            className="uk-margin-small"
            placeholder="Upload Predictions"
            file={predFile}
            setFile={setPredFile}
            lines={predFileLines}
            linesAreSame={null}
          />
          <p className="uk-text-right">
            <button className="uk-button uk-button-default uk-modal-close" type="button">
              Cancel
            </button>
            <button
              className="uk-button uk-button-primary"
              onClick={() => console.log("hello")}
              type="button"
            >
              Save
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export { Visualization };
