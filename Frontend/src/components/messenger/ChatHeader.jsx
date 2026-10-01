import {
  useClearSelection,
  useHandleDeleteMessages,
  useParticipantStatus,
  useSelectedChat,
  useSelectedMessageIds,
} from "../../stores/chatStore";

const ChatHeader = () => {
  const selectedChat = useSelectedChat();
  const participantStatus = useParticipantStatus();
  const selectedMessageIds = useSelectedMessageIds();
  const handleDeleteMessages = useHandleDeleteMessages();
  const clearSelection = useClearSelection();

  if (!selectedChat) return null;

  return (
    <div className="p-5 bg-linear-to-r from-blue-50 to-indigo-50 shadow-xs border-b">
      <div className="flex items-center">
        <div
          className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg"
          style={{
            background: selectedChat.avatar?.color,
            backgroundImage: selectedChat.avatar?.color
              ? `linear-gradient(to bottom right, ${selectedChat.avatar.color}, ${selectedChat.avatar.color}80)`
              : undefined,
          }}
        >
          <span className="font-semibold">{selectedChat.avatar?.initials}</span>
        </div>

        <div className="ml-4 min-w-0">
          <div className="font-bold text-lg text-gray-800 leading-tight truncate">
            {selectedChat.name}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {participantStatus || "offline"}
          </div>
        </div>

        {selectedMessageIds.length > 0 && (
          <div className="ml-auto flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {selectedMessageIds.length} selected
            </span>
            <button
              type="button"
              onClick={handleDeleteMessages}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
