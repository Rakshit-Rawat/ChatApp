import React,{useState,useEffect} from 'react'
import { Search } from 'lucide-react';
import axios from 'axios';

const SearchSection = ({setChats,user}) => {
  const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const backendUrl=import.meta.env.VITE_BACKEND_URL

      useEffect(() => {

    const handler = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const response = await axios.get(
            `${backendUrl}/api/user/search`,
            {
              params: { q: searchQuery.trim() },
            }
          );
          setSearchResults(response.data);
        } catch (error) {
          console.error("Error Fetching:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);


   const handleSelectUser = async (selectedUser) => {
    if (!user) return;

    const existingChat = chats.find(
      (chat) => chat.name === selectedUser.username
    );

    if (!existingChat) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/conversation/create`,
          {
            participants: [user.username, selectedUser.username],
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const newChat = {
          id: response.data._id,
          name: selectedUser.username,
          avatar: response.data.avatar,
          lastMessage: "Start a conversation",
          time: new Date().toLocaleTimeString(),
          participants: response.data.participants,
        };

        setChats((prevChats) => [newChat, ...prevChats]);
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    }

    setSearchQuery("");
    setSearchResults([]);
  };



  return (
     <div className="p-4 border-b relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-8 border rounded"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && searchQuery && (
            <div
              className="absolute left-4 right-4 mt-2 
             bg-white 
              border-0 
              rounded-2xl 
              shadow-2xl 
              z-20 
              overflow-hidden
              animate-fade-in"
            >
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="p-3 
          hover:bg-blue-50 
          cursor-pointer 
          transition-colors 
          duration-300 
          group 
          border-b 
          last:border-b-0 
          border-gray-100"
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-12 h-12 
              rounded-full 
              flex items-center 
              justify-center 
              text-white 
              text-xl 
              shadow-md 
              transform 
              transition-transform 
              group-hover:scale-110"
                        style={{
                          background: user.avatar.color,
                          backgroundImage: `linear-gradient(to bottom right, ${user.avatar.color}, ${user.avatar.color}80)`,
                        }}
                      >
                        {user.avatar.initials}
                      </div>
                      <div className="ml-4 flex-1">
                        <div
                          className="font-semibold 
              text-gray-800 
              group-hover:text-blue-600 
              transition-colors"
                        >
                          {user.username}
                        </div>
                        {user.email && (
                          <div className="text-sm text-gray-500 truncate">
                            {user.email}
                          </div>
                        )}
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="absolute left-4 right-4 mt-2 bg-white border rounded-lg shadow-lg z-20 p-4 text-center text-gray-500">
              Searching...
            </div>
          )}
        </div>
  )
}

export default SearchSection