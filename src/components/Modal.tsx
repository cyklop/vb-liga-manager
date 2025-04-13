import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string; // Add optional maxWidth prop (e.g., 'max-w-md', 'max-w-lg', 'max-w-2xl')
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => { // Default to 'max-w-md'
  if (!isOpen) return null;

  return (
    // Add z-index to the overlay div
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50"> {/* Increased opacity slightly */}
      {/* Apply maxWidth prop to the modal container div */}
      <div className={`bg-white dark:bg-card p-5 rounded-lg shadow-xl w-full ${maxWidth} relative mx-4`}> {/* Use maxWidth prop, dark:bg-card, shadow-xl, mx-4 for small screen padding */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-border"> {/* Added bottom border */}
          <h3 className="text-lg font-semibold dark:text-foreground">{title}</h3> {/* Adjusted font weight and dark color */}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"> {/* Adjusted colors */}
            <span className="sr-only">Schließen</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
