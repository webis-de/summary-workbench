import React, { useState, useRef } from "react";

const ChooseFile = ({ kind, className, name, file, setFile }) => {
  const uploadRef = useRef()
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
    <div>
      <div
        className="uk-width-expand"
        onDragOver={(e) => {
          setIsDragged(true);
          e.preventDefault();
        }}
        onDragLeave={(e) => setIsDragged(false)}
        onDrop={(e) => dropHandler(e)}
        style={isDragged ? { borderStyle: "solid", borderWidth: "1px" } : {}}
      >
        <input
          className="uk-input"
          type="text"
          value={file === null ? "" : file.name}
          onClick={() => uploadRef.current.click()}
          placeholder={"Upload file with " + kind }
          readOnly
          style={{"borderColor": "lightgrey"}}
        />
        <input type="file" ref={uploadRef} onChange={fileSelectOnChange} style={{display: "none"}} />
      </div>
    </div>
  );
};

export { ChooseFile };
