import React, { useEffect, useRef, useState } from "react";

import { displayMessage } from "../../utils/message";
import { readFile } from "../../utils/readFile";

const sameLength = (elements) => {
  const validElements = elements.filter((e) => e !== null);
  if (!validElements.length) {
    return true;
  }
  const [first, ...other] = validElements;
  return other.every((e) => e.length === first.length);
};

const useFile = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [lines, setLines] = useState(null);
  useEffect(() => {
    if (file) {
      readFile(file)
        .then((text) => text.trim())
        .then((text) => {
          setLines(text.split("\n").map((line) => line.trim()));
          setFileName(file.name);
        })
        .catch((err) => displayMessage(err.message));
    } else {
      setLines(null);
      setFileName(null);
    }
  }, [file]);

  return [fileName, setFile, lines];
};

const ChooseFile = ({ kind, name, fileName, setFile, lines, linesAreSame, ...other }) => {
  const uploadRef = useRef();
  const [isDragged, setIsDragged] = useState(false);
  const dropHandler = (e) => {
    e.preventDefault();

    if (e.dataTransfer.items) {
      for (const item of e.dataTransfer.items) {
        const entry = item.webkitGetAsEntry();
        if (entry !== null && entry.isFile) {
          setFile(item.getAsFile());
        }
      }
    }
    setIsDragged(false);
  };

  const fileSelectOnChange = (e) => setFile(e.target.files[0]);

  return (
    <div onFocus={() => uploadRef.current.click()} {...other}>
      <div
        className="uk-flex uk-flex-stretch uk-box-shadow-hover-medium"
        onDragOver={(e) => {
          setIsDragged(true);
          e.preventDefault();
        }}
        onDragLeave={() => setIsDragged(false)}
        onDrop={(e) => dropHandler(e)}
        onClick={() => uploadRef.current.click()}
        style={isDragged ? { borderStyle: "solid", borderWidth: "1px" } : {}}
      >
        <input
          className="uk-textarea"
          type="text"
          value={fileName}
          placeholder={"Upload file with " + kind}
          readOnly
          style={{ borderColor: "lightgrey" }}
        />
        {lines !== null && (
          <span
            className="uk-flex uk-flex-middle"
            style={{
              ...(linesAreSame === null
                ? { backgroundColor: "#f8f8f8" }
                : linesAreSame
                ? { backgroundColor: "#32d296", color: "white" }
                : { backgroundColor: "#f0506e", color: "white" }),
              ...{
                paddingLeft: "10px",
                paddingRight: "10px",
                whiteSpace: "nowrap",
              },
            }}
          >
            {`${lines.length} lines`}
          </span>
        )}
        <input
          type="file"
          ref={uploadRef}
          onChange={fileSelectOnChange}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export { ChooseFile, useFile, sameLength };
