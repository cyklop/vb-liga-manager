import React from 'react'

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  confirmButtonText?: string; // Optionaler Prop für den Button-Text
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ 
  onConfirm, 
  onCancel, 
  message, 
  confirmButtonText = 'Löschen' // Standardwert 'Löschen'
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Bestätigung</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-sm hover:bg-gray-400"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600"
          >
            {confirmButtonText} {/* Verwende den Prop-Wert oder den Standardwert */}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmation
