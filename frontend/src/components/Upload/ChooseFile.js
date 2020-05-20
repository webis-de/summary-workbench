import React, { useState } from "react";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";

import { UploadButton } from "./UploadButton";

const ChooseFile = ({ name, file, setFile }) => {
  const [isDragged, setIsDragged] = useState(false);
  const dropHandler = (e) => {
    e.preventDefault();

    if (e.dataTransfer.items) {
      for (const item of e.dataTransfer.items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          setFile(file);
        }
      }
    }
    setIsDragged(false);
  };

  return (
    <div
      onDragOver={(e) => {
        setIsDragged(true);
        e.preventDefault();
      }}
      onDragLeave={(e) => setIsDragged(false)}
      onDrop={(e) => dropHandler(e)}
      readOnly
      style={isDragged ? { borderStyle: "solid", borderWidth: "1px" } : {}}
    >
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>{name}:</InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl value={file !== null ? file.name : ""} />
        <InputGroup.Append>
          <UploadButton setFile={setFile} />
        </InputGroup.Append>
      </InputGroup>
    </div>
  );
};

export { ChooseFile };
