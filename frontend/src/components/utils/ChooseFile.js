import React, { useContext, useEffect, useRef, useState } from "react";

import { DragContext } from "../../contexts/DragContext";
import { displayError } from "../../utils/message";
import { readFile } from "../../utils/readFile";

const sameLength = (elements) => {
  const validElements = elements.filter((e) => e !== null);
  if (!validElements.length) return true;
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
        .catch(displayError);
    } else {
      setLines(null);
      setFileName(null);
    }
  }, [file]);

  return [fileName, setFile, lines];
};

const processDropEvent = (e) => {
  e.preventDefault();
  const files = [];
  const { items } = e.dataTransfer;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = item.webkitGetAsEntry();
      if (entry !== null && entry.isFile) {
        files.push(item.getAsFile());
      }
    }
  }
  return files;
};

const ChooseFile = ({ kind, fileName, setFile, lines, linesAreSame = true }) => {
  const dragged = useContext(DragContext);
  const uploadRef = useRef();

  const onDrop = (e) => {
    const files = processDropEvent(e);
    if (files.length) setFile(files[0]);
  };
  const onClick = () => uploadRef.current.click();

  let classExtra = "bg-red-600 text-white";
  if (linesAreSame === null) classExtra = "text-black bg-white";
  else if (linesAreSame) classExtra = "bg-green-600 text-white";

  const showLineBox = lines !== null;

  return (
    <button
      className={`${
        dragged
          ? "outline-dashed outline-2 outline-offset-4 outline-black"
          : "focus:ring focus:ring-blue-600"
      } w-full flex items-stretch ring-2 ring-slate-600 divide-slate-600 divide-x-2 text-sm rounded-lg`}
      onDrop={onDrop}
      onClick={onClick}
    >
      <button className="px-3 bg-gray-700 text-white flex items-center whitespace-nowrap rounded-l-lg hover:bg-gray-600">
        Upload File
      </button>
      <input
        className={`${
          showLineBox ? "" : "rounded-r-lg"
        } border-none block w-full bg-gray-50 text-gray-900 text-sm`}
        type="text"
        value={fileName || ""}
        placeholder={`Upload ${kind}`}
        disabled
        readOnly
      />
      {showLineBox && (
        <span
          className={`${classExtra} flex items-center whitespace-nowrap p-2 rounded-r-lg`}
        >{`${lines.length} lines`}</span>
      )}
      <input
        className="hidden"
        type="file"
        ref={uploadRef}
        onChange={(e) => {
          const file = e.currentTarget.files[0];
          if (file) setFile(file);
        }}
      />
    </button>
  );
};

export { ChooseFile, useFile, sameLength };
