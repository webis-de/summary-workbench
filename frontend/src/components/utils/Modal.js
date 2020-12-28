import React from "react";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

const customStyles = {
  overlay: { zIndex: "10000" },
  content: {
    outline: null,
    top: "50%",
    width: "min(500px, 80vw)",
    left: "50%",
    right: "auto",
    bottom: "auto",
    maxHeight: "80vh",
    overflowY: "auto",
    transform: "translate(-50%, -50%)",
  },
};

const Modal = ({ children, ...other }) => (
  <ReactModal style={customStyles} {...other}>
    {children}
  </ReactModal>
);

export { Modal };
