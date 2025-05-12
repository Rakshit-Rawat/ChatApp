import React from 'react';

const Message = ({ message, isCurrentUser, isSelected, toggleMessageSelection, userId, username }) => {
  const isOwner = message.senderId === userId || message.senderUsername === username;
  
  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} transition-all duration-300`}
    >
      <div
        onClick={() => {
          if (isCurrentUser) {
            toggleMessageSelection(message._id);
          }
        }}
        className={`
          max-w-[70%] 
          rounded-2xl 
          p-3 
          shadow-md 
          relative 
          ${isCurrentUser
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            : "bg-white border border-gray-100"
          }
          ${isSelected ? "ring-2 ring-offset-2 ring-red-400" : ""}
          transform 
          transition-all 
          duration-300 
          hover:scale-[1.02]
          ${isCurrentUser ? "cursor-pointer" : ""}
        `}
        style={{
          wordBreak: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {isCurrentUser && isSelected && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg z-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
        <p
          className="relative z-10"
          style={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {message.content}
        </p>
        <span
          className={`text-xs block mt-1 text-right ${
            isCurrentUser ? "text-blue-100" : "text-gray-400"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {isCurrentUser && (
          <div className="absolute inset-0 bg-blue-600 opacity-20 rounded-2xl blur-sm z-0"></div>
        )}
      </div>
    </div>
  );
};

export default Message;