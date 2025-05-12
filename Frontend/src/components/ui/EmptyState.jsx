import React from 'react';

const EmptyState = () => {
  return (
    <div className="text-gray-500 flex items-center justify-center h-full w-full text-center">
      <div className="flex flex-col items-center space-y-3 p-6 bg-white/50 rounded-lg shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-gray-400 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-600">
          Select a Chat
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Choose a conversation from the sidebar or start a new chat
        </p>
      </div>
    </div>
  );
};

export default EmptyState;