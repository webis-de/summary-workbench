import { Dialog } from "@headlessui/react";
import React, { useState } from "react";

const ModalTitle = ({ children }) => (
  <Dialog.Title className="text-3xl font-bold">{children}</Dialog.Title>
);

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return [isOpen, open, close];
};

const Modal = ({ children, isOpen, close }) => (
  <Dialog open={isOpen} onClose={close}>
    <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
    <div className="fixed bg-white shadow-xl shadow-stone-400 z-50 border inset-x-12 inset-y-6 overflow-y-auto bg-slate">
      {children}
    </div>
  </Dialog>
);

export { Modal, ModalTitle, useModal };
