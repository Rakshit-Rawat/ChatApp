import React from 'react';
import Message from './Message';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyConvo from '../ui/EmptyConvo';

const MessageList = ({ 
  messagesLoading, 
  selectedChat, 
  messages, 
  user, 
  selectedMessageIds, 
  toggleMessageSelection, 
  messagesEndRef 
}) => {
  
  if (messagesLoading) {
    return <LoadingSpinner message="Loading messages..." />;
  }

  
  if (!selectedChat) {
    return null;
  }

  if (messages.length === 0) {
    return <EmptyConvo selectedChat={selectedChat} />;
  }
  return (
    <div 
      className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-blue-50 to-indigo-50 scrollbar 
        scrollbar-thumb-black scrollbar-track-black"
    >
      <div className="space-y-4">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === user.id || msg.senderUsername === user.username;
          const isSelected = selectedMessageIds.includes(msg._id);

          return (
            <Message 
              key={msg._id || index}
              message={msg}
              isCurrentUser={isCurrentUser}
              isSelected={isSelected}
              toggleMessageSelection={toggleMessageSelection}
              userId={user.id}
              username={user.username}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;