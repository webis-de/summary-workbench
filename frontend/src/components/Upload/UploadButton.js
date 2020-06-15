import React, { useRef } from "react";
import Button from "react-bootstrap/Button";
import { FaUpload } from "react-icons/fa";

const UploadButton = ({ setFile }) => {
  const fileInputRef = useRef()

  const fileSelectOnChange = () => {
    const files = fileInputRef.current.files;
    const file = files[0];
    setFile(file)
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
