const ChatItem = ({ chat, onClick }) => (
  <button
    type="button"
    className="w-full p-4 border-b border-gray-100 hover:bg-white text-left transition-all duration-300 group relative"
    onClick={onClick}
  >
    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

    <div className="flex items-center">
      <div
        className="w-12 h-12 flex rounded-full items-center justify-center text-white shadow-md transition-all duration-300"
        style={{
          background: chat.avatar?.color,
          backgroundImage: chat.avatar?.color
            ? `linear-gradient(to bottom right, ${chat.avatar.color}, ${chat.avatar.color}80)`
            : undefined,
        }}
      >
        {chat.avatar?.initials}
      </div>

      <div className="ml-4 flex-1 min-w-0">
        <div className="font-semibold text-gray-600 group-hover:text-neutral-900 transition-all truncate">
          {chat.name}
        </div>
        <div className="text-sm text-gray-500 truncate max-w-[200px]">
          {chat.lastMessage}
        </div>
      </div>

      <div className="text-xs text-gray-400 group-hover:text-neutral-950 transition-colors ml-3">
        {chat.time}
      </div>
    </div>
  </button>
);

export default ChatItem;
