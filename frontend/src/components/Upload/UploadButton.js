import React, { useRef } from "react";
import Button from "react-bootstrap/Button";
import { FaUpload } from "react-icons/fa";

const UploadButton = ({ getFilesRequest, uploadFileRequest, setFiles }) => {
  const fileinputRef = useRef();

  const fileSelectOnChange = () => {
    const files = fileinputRef.current.files;
    if (files.length > 0) {
      const file = files[0];
      file.text().then(text => {
        const filename = file.name;
        const filecontent = text;
        uploadFileRequest(filename, filecontent).then(() => {
          getFilesRequest()
            .then(response => response.json())
            .then(files => {
              setFiles(files);
            });
        });
      });
    }
  };
  return (
    <>
      <Button variant="primary" onClick={() => fileinputRef.current.click()}>
        <FaUpload />
      </Button>
      <input
        ref={fileinputRef}
        type="file"
        onChange={fileSelectOnChange}
        style={{ display: "none" }}
      />
    </>
  );
};

export { UploadButton };
