import React, { useState } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { UploadButton } from "./UploadButton";

const ChooseFile = ({ name, fileInputRef }) => {
  const [fileName, setFileName] = useState([]);

  return (
    <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text>{name}:</InputGroup.Text>
      </InputGroup.Prepend>
      <FormControl value={fileName} readOnly style={{backgroundColor: "white"}} />
      <InputGroup.Append>
        <UploadButton setFileName={setFileName} fileInputRef={fileInputRef} />
      </InputGroup.Append>
    </InputGroup>
  );
};

export { ChooseFile }
