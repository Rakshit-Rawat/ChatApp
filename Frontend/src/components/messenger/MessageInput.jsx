import React from 'react';

const MessageInput = ({ selectedChat, newMessage, setNewMessage, handleSendMessage }) => {
  if (!selectedChat) {
    return null;
  }

  const handleKeyDown = (e) => {
    if (e.code === "Enter") {
      e.preventDefault();
      handleSendMessage(newMessage,setNewMessage);
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50">
      <div className="flex items-center space-x-3 bg-white rounded-full p-1 shadow-lg border border-blue-100 hover:border-blue-200 transition-all duration-300">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2 bg-transparent text-gray-700 placeholder-gray-400 rounded-full focus:outline-none"
        />
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white 
            px-6 py-2 rounded-full 
            hover:from-blue-600 hover:to-purple-700 
            transform hover:scale-105 
            transition-all duration-300 
            shadow-md hover:shadow-xl 
            active:scale-95"
          onClick={()=>handleSendMessage(newMessage,setNewMessage)}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;