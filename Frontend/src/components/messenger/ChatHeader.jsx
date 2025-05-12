import React from 'react';

const ChatHeader = ({ selectedChat, participantStatus, selectedMessageIds, handleDeleteMessages, clearSelection }) => {
  return (
    <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm border-b">
      <div className="flex items-center">
        <div
          className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white 
          shadow-md transform transition-all duration-300 
          hover:scale-110 hover:shadow-lg"
          style={{
            background: `${selectedChat.avatar.color}`,
            backgroundImage: `linear-gradient(to bottom right, ${selectedChat.avatar.color}, ${selectedChat.avatar.color}80)`,
          }}
        >
          <span className="font-semibold">
            {selectedChat.avatar.initials}
          </span>
        </div>
        <div className="ml-4">
          <div className="font-bold text-lg text-gray-800 leading-tight">
            {selectedChat.name}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {participantStatus}
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-3">
          {selectedMessageIds.length > 0 && (
            <>
              <span className="text-sm text-gray-500">
                {selectedMessageIds.length} selected
              </span>
              <button
                onClick={handleDeleteMessages}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
          <button className="text-gray-600 hover:text-blue-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;