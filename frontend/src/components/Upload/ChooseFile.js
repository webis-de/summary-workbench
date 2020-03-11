import React, { useState, useEffect } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { UploadButton } from "./UploadButton";

const ChooseFile = ({
  selectRef,
  getFilesRequest,
  uploadFileRequest,
  name
}) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    getFilesRequest()
      .then(response => response.json())
      .then(files => {
        setFiles(files);
      });
  }, [getFilesRequest]);
  return (
    <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text>{name}:</InputGroup.Text>
      </InputGroup.Prepend>
      <FormControl ref={selectRef} className="custom-select" as="select">
        {files.map((filename, i) => (
          <option key={i}>{filename}</option>
        ))}
      </FormControl>
      <InputGroup.Append>
        <UploadButton
          getFilesRequest={getFilesRequest}
          uploadFileRequest={uploadFileRequest}
          setFiles={setFiles}
        />
      </InputGroup.Append>
    </InputGroup>
  );
};

export { ChooseFile }
