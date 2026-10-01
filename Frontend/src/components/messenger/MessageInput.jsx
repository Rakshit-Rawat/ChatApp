import { useAuthUser } from "../../stores/authStore";
import {
  useHandleSendMessage,
  useNewMessage,
  useSelectedChat,
  useSetNewMessage,
} from "../../stores/chatStore";
import { useSocket } from "../../stores/socketStore";

const MessageInput = () => {
  const selectedChat = useSelectedChat();
  const newMessage = useNewMessage();
  const setNewMessage = useSetNewMessage();
  const handleSendMessage = useHandleSendMessage();
  const user = useAuthUser();
  const socket = useSocket();

  if (!selectedChat) return null;

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    void handleSendMessage(user, socket);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-4 bg-linear-to-r from-indigo-50 to-blue-50">
      <div className="flex items-center space-x-3 bg-white rounded-full p-1 shadow-lg border border-blue-100 hover:border-blue-200 transition-all duration-300">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2 bg-transparent text-gray-700 placeholder-gray-400 rounded-full focus:outline-hidden"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
