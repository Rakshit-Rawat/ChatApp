const ChatItem = ({ chat, onClick }) => {
  return (
    <div
      className="p-4 border-b border-gray-100 hover:bg-white cursor-pointer transition-all duration-300 group relative"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

      <div className="flex items-center">
        <div
          className="w-12 h-12 flex rounded-full items-center justify-center text-white shadow-md transform transition-all duration-300 "
          style={{
            background: chat.avatar.color,
            backgroundImage: `linear-gradient(to bottom right, ${chat.avatar.color}, ${chat.avatar.color}80)`,
          }}
        >
          {chat.avatar.initials}
        </div>

        <div className="ml-4 flex-1">
          <div className="font-semibold text-gray-600 group-hover:text-neutral-900 transition-all">
            {chat.name}
          </div>
          <div className="text-sm text-gray-500 truncate max-w-[200px]">
            {chat.lastMessage}
          </div>
        </div>

        <div className="text-xs text-gray-400 group-hover:text-neutral-950 transition-colors">
          {chat.time}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;