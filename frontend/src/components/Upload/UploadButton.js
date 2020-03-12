import React from "react";
import Button from "react-bootstrap/Button";
import { FaUpload } from "react-icons/fa";

const UploadButton = ({ setFileName, fileInputRef }) => {
  const fileSelectOnChange = () => {
    const files = fileInputRef.current.files;
    const file = files[0];
    setFileName(file.name)
  };

  return (
    <>
      <Button variant="primary" onClick={() => fileInputRef.current.click()}>
        <FaUpload />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        onChange={fileSelectOnChange}
        style={{ display: "none" }}
      />
    </>
  );
};

export { UploadButton };
