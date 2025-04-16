import React, { useRef, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  // maxWidth prop is removed as DaisyUI modals handle width via modal-box modifiers if needed
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      if (isOpen) {
        modalElement.showModal();
      } else {
        // Check if the modal is still open before trying to close
        // This prevents errors if the modal was closed by other means (e.g., ESC key)
        if (modalElement.hasAttribute('open')) {
          modalElement.close();
        }
      }
    }
  }, [isOpen]);

  // Handle closing via the backdrop click or ESC key
  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      const handleCancel = (event: Event) => {
        event.preventDefault(); // Prevent default dialog cancel behavior if needed
        onClose();
      };
      modalElement.addEventListener('cancel', handleCancel);

      // Optional: Close on backdrop click (default DaisyUI behavior)
      // If you want to prevent closing on backdrop click, you might need
      // to add a click handler to the dialog itself and check event.target

      return () => {
        modalElement.removeEventListener('cancel', handleCancel);
      };
    }
  }, [onClose]);


  // We render the dialog structure but control its visibility via useEffect and showModal/close
  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box">
        {/* Header with Title and Close Button */}
        <div className="flex justify-between items-center pb-3">
          <h3 className="font-bold text-lg">{title}</h3>
          {/* DaisyUI close button */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
        </div>
        {/* Modal Content */}
        {/* Add padding or specific styling for content area if needed */}
        <div className="py-4 max-h-[70vh] overflow-y-auto">
             {children}
        </div>
        {/* Modal Actions (optional, usually buttons are placed within children) */}
        {/* <div className="modal-action"> */}
        {/*   <button className="btn" onClick={onClose}>Close</button> */}
        {/* </div> */}
      </div>
      {/* Optional: Click backdrop to close */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default Modal;
