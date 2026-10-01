import EmptyConvo from "../ui/EmptyConvo";
import LoadingSpinner from "../ui/LoadingSpinner";
import Message from "./Message";
import {
  useMessages,
  useMessagesLoading,
  useSelectedChat,
  useSelectedMessageIds,
  useToggleMessageSelection,
} from "../../stores/chatStore";
import { useAuthUser } from "../../stores/authStore";

const MessageList = ({ messagesEndRef }) => {
  const messages = useMessages();
  const messagesLoading = useMessagesLoading();
  const selectedChat = useSelectedChat();
  const selectedMessageIds = useSelectedMessageIds();
  const toggleMessageSelection = useToggleMessageSelection();
  const user = useAuthUser();

  if (messagesLoading) {
    return <LoadingSpinner message="Loading messages..." />;
  }

  if (!selectedChat) return null;
  if (messages.length === 0) return <EmptyConvo selectedChat={selectedChat} />;

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-linear-to-b from-blue-50 to-indigo-50 scrollbar">
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isCurrentUser =
            message.sender?._id === user?.id ||
            message.sender === user?.id ||
            message.senderId === user?.id ||
            message.senderUsername === user?.username;

          return (
            <Message
              key={message._id || index}
              message={message}
              isCurrentUser={isCurrentUser}
              isSelected={selectedMessageIds.includes(message._id)}
              toggleMessageSelection={toggleMessageSelection}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
