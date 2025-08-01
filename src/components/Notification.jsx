import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const Notification = ({ message, onClose, type = 'success' }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`rounded-lg shadow-lg p-4 max-w-xs flex items-start ${type === 'success' ? 'bg-green-100 border border-green-200' : 'bg-blue-100 border border-blue-200'}`}>
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
        ) : (
          <div className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" /> // Placeholder for info icon if needed
        )}
        <div className="ml-3 flex-1">
          <p className={`text-sm ${type === 'success' ? 'text-green-700' : 'text-blue-700'}`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`ml-2 rounded-md ${type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-blue-500 hover:text-blue-700'}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;