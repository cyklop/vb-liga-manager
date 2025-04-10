import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Füge hier eine z-index Klasse hinzu (z.B. z-50)
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      {/* Optional: Füge auch hier einen z-index hinzu, falls das innere Div Probleme macht, aber normalerweise ist der äußere ausreichend */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg w-full max-w-md relative"> {/* dark:bg hinzugefügt & relative für innere Elemente */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium dark:text-gray-100">{title}</h3> {/* dark:text hinzugefügt */}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-100"> {/* dark styles hinzugefügt */}
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
