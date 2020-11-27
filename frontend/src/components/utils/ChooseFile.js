import React, { useRef, useState } from "react";

const ChooseFile = ({ kind, className, name, file, setFile, lines, linesAreSame, ...other }) => {
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
    <div {...other}>
      <div
        className="uk-flex uk-flex-stretch"
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
          value={file ? file.name : ""}
          placeholder={"Upload file with " + kind}
          readOnly
          style={{ borderColor: "lightgrey" }}
        />
        {lines !== null && (
          <span
            className={`uk-flex uk-flex-middle`}
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
            {`${lines} lines`}
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

export { ChooseFile };
