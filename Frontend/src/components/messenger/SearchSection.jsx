import { useEffect, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";

import { useAuthUser } from "../../stores/authStore";
import { useChats, useSetChats } from "../../stores/chatStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const user = useAuthUser();
  const chats = useChats();
  const setChats = useSetChats();

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) return undefined;

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);

      try {
        const response = await axios.get(`${backendUrl}/api/user/search`, {
          params: { q: query },
        });

        setSearchResults(
          response.data.filter((result) => result.username !== user?.username),
        );
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, user?.username]);

  const handleSelectUser = async (selectedUser) => {
    if (!user) return;

    const existingChat = chats.find(
      (chat) => chat.name === selectedUser.username,
    );

    if (!existingChat) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/conversation/create`,
          { participants: [user.username, selectedUser.username] },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          },
        );

        const otherParticipant =
          response.data.participants?.find(
            (participant) => participant.username === selectedUser.username,
          ) || selectedUser;

        const newChat = {
          id: response.data._id,
          name: selectedUser.username,
          avatar: otherParticipant.avatar || selectedUser.avatar,
          lastMessage: "Start a conversation",
          time: "",
          participants: response.data.participants,
        };

        setChats([newChat, ...chats]);
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    }

    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  return (
    <div className="p-4 border-b relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 pl-8 border rounded"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
      </div>

      {searchResults.length > 0 && searchQuery && (
        <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl z-20 overflow-hidden">
          <div className="max-h-64 overflow-y-auto scrollbar">
            {searchResults.map((result) => (
              <button
                type="button"
                key={result._id}
                className="w-full p-3 hover:bg-blue-50 text-left transition-colors group border-b last:border-b-0 border-gray-100"
                onClick={() => handleSelectUser(result)}
              >
                <div className="flex items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-md transition-transform group-hover:scale-110"
                    style={{
                      background: result.avatar?.color,
                      backgroundImage: result.avatar?.color
                        ? `linear-gradient(to bottom right, ${result.avatar.color}, ${result.avatar.color}80)`
                        : undefined,
                    }}
                  >
                    {result.avatar?.initials}
                  </div>

                  <div className="ml-4 flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {result.username}
                    </div>
                    {result.email && (
                      <div className="text-sm text-gray-500 truncate">
                        {result.email}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isSearching && (
        <div className="absolute left-4 right-4 mt-2 bg-white border rounded-lg shadow-lg z-20 p-4 text-center text-gray-500">
          Searching...
        </div>
      )}
    </div>
  );
};

export default SearchSection;
