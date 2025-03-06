import { useState, useEffect, useRef } from "react";
import { LogOut, Settings, Search, Edit, Bell } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import axios from "axios";

const MessengerLayout = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [chats, setChats] = useState([]);
  const [participantStatus, setParticipantStatus] = useState(false);
  const [chatheaderHeight, setChatHeaderHeight] = useState(0);
  const [loadingChats, setLoadingChats] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const { user, setUser, logout } = useAuth();
  const socket = useSocket();

  const chatHeaderRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatHeaderRef.current) {
      setChatHeaderHeight(chatHeaderRef.current.offsetHeight);
    }
  }, [chatHeaderRef]);

  useEffect(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !user?.username) return;

    console.log("Connecting socket with user:", user.username);

    socket.on("receive-message", (messageData) => {
      setMessages((prev) => [...prev, messageData]);

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === messageData.conversationId) {
            return {
              ...chat,
              lastMessage: messageData.content,
              time: new Date(messageData.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
            };
          }
          return chat;
        })
      );
    });

    return () => {
      socket.off("receive-message");
    };
  }, [socket, user]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.username) return;

      try {
        setLoadingChats(true);
        const response = await axios.get(
          `http://localhost:5000/api/conversation/${user.username}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const fetchedChats = response.data.map((chat) => {
          const otherParticipant = chat.participants.find(
            (p) => p.username !== user.username
          );

          const timestamp = chat.lastMessage?.timestamp
            ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "";

          return {
            id: chat._id,
            name: otherParticipant?.username,
            avatar: otherParticipant?.avatar,
            lastMessage: chat.lastMessage?.content || "Start a conversation",
            time: timestamp,
            participants: chat.participants,
          };
        });

        setChats(fetchedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, [user]);

  const handleChatSelect = async (chat) => {
    setSelectedChat((prevChat) => ({
      ...chat,
      user: prevChat?.user || user,
    }));

    setMessagesLoading(true);

    socket.emit("check-status", { participantUsername: chat.name });

    // Listen for the status response from the server
    socket.once("status-response", ({ participantUsername, status }) => {
      if (participantUsername === chat.name) {
        setParticipantStatus(status); 
        console.log(`Participant ${participantUsername} is ${status}`);
      }
    });

    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/${chat.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.username) return;

    const otherParticipant = selectedChat.participants.find(
      (p) => p.username !== user.username
    );

    if (!otherParticipant) {
      console.error("No other participant found");
      return;
    }

    const timestamp = new Date();
    const isoTimestamp = timestamp.toISOString();
    const formattedTime = timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const messageData = {
      conversationId: selectedChat.id,
      senderId: user.id,
      senderUsername: user.username,
      receiverId: otherParticipant._id,
      receiverUsername: otherParticipant.username,
      content: newMessage,
      timestamp: isoTimestamp,
    };

    const tempMessage = {
      ...messageData,
      _id: `temp-${Date.now()}`,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const { data: savedMessage } = await axios.post(
        "http://localhost:5000/api/messages",
        messageData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      socket.emit("send-message", {
        conversationId: selectedChat.id,
        senderId: user.id,
        senderUsername: user.username,
        receiverId: otherParticipant._id,
        receiverUsername: otherParticipant.username,
        message: newMessage,  
        timestamp: isoTimestamp,
      });

      await axios.patch(
        `http://localhost:5000/api/conversation/${selectedChat.id}`,
        {
          lastMessage: {
            content: newMessage,
            senderId: user.id,
            senderUsername: user.username,
            timestamp: isoTimestamp,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? savedMessage : msg))
      );

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                lastMessage: newMessage,
                time: formattedTime,
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    }
  };

  const handleLogout = async () => {
    if (socket) {
      socket.emit("user-disconnected", user?.username);
    }
    setUser(null);
    localStorage.removeItem("authToken");
    await logout();
  };

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const response = await axios.get(
            "http://localhost:5000/api/user/search",
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

  
  // Handle selecting a user from search results
  const handleSelectUser = async (selectedUser) => {
    if (!user) return;

    const existingChat = chats.find(
      (chat) => chat.name === selectedUser.username
    );

    if (!existingChat) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/conversation/create",
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-100 border-r bg-white flex flex-col">
        {/* User Profile Section */}
        <div className="p-5 border-b relative">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
              style={{ background: user?.avatar?.color }}
            >
              {user?.avatar?.initials}
            </div>
            <div className="ml-3 flex-1">
              <div className="font-medium">{user?.username}</div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute top-20 left-4 right-4 bg-white border rounded-lg shadow-lg z-10">
              <div className="p-[14px] border-b">
                <div className="font-medium">My Profile</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded flex items-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Section */}
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
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {loadingChats ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                  <div className="relative z-10 w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-blue-500 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  Loading Chats...
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Fetching your conversations
                </div>
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg
                    className="w-10 h-10 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  No Chats Available
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Start a conversation to see it here.
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                  New Chat
                </button>
              </div>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className="p-4 border-b border-gray-100 hover:bg-white cursor-pointer transition -all duration-300 group relative "
                onClick={() => handleChatSelect(chat)}
              >
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

                <div className="flex items-center">
                  <div
                    className="w-12 h-12 flex   rounded-full items-center justify-center text-white shadow-md transform transition-all duration-300 group-hover:scale-110 "
                    style={{
                      background: chat.avatar.color,
                      
                      backgroundImage: `linear-gradient(to bottom right, ${chat.avatar.color}, ${chat.avatar.color}80)`,
                    }}
                  >
                    {chat.avatar.initials}
                  </div>

                  <div className="ml-4 flex-1">
                    <div className="font-semibold text-gray-800 group-hover:text-xl transition-all">
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
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div
          ref={chatHeaderRef}
          className={`p-5  bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm ${
            selectedChat
              ? "border-b"
              : "flex items-center justify-center h-full"
          }`}
        >
          {selectedChat ? (
            <div className="flex items-center">
              <div
                className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white 
                 shadow-md transform transition-all duration-300 
                 hover:scale-110 hover:shadow-lg"
                style={{
                  background: `${selectedChat.avatar.color}`,
                  backgroundImage: `linear-gradient(to bottom right, ${selectedChat.avatar.color}, ${selectedChat.avatar.color}80)`,
                }}
              >
                <span className="font-semibold">
                  {selectedChat.avatar.initials}
                </span>
              </div>
              <div className="ml-4">
                <div className="font-bold text-lg text-gray-800 leading-tight">
                  {selectedChat.name}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {participantStatus}
                </div>
              </div>

              <div className="ml-auto flex items-center space-x-3">
                <button className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 flex items-center justify-center h-full w-full text-center">
              <div className="flex flex-col items-center space-y-3 p-6 bg-white/50 rounded-lg shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-600">
                  Select a Chat
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Choose a conversation from the sidebar or start a new chat
                </p>
              </div>
            </div>
          )}
        </div>

        {/* messages preview*/}

        <div
          className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-blue-50 to-indigo-50 scrollbar 
          
  scrollbar-thumb-black 
  scrollbar-track-black"
        >
          <div className="space-y-4">
            {messagesLoading ? (
              <div
                className=" items-center justify-center h-full"
                style={{ height: "100%", marginTop: chatheaderHeight }}
              >
                <div className="flex items-center pt-[150px] justify-center ">
                  <div className="loading-animation">
                    <div className="loading-circle"></div>
                    <div className="loading-circle"></div>
                    <div className="loading-circle"></div>
                    <span className="loading-text">Loading...</span>
                  </div>
                </div>
              </div>
            ) : selectedChat ? (
              messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 bg-white/50 p-6 rounded-xl max-w-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No Messages Yet
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Start a conversation with {selectedChat.name}. Be the
                      first to send a message!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isCurrentUser =
                    msg.senderId === user.id ||
                    msg.senderUsername === user.username;
                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      } transition-all duration-300`}
                    >
                      <div
                        onClick={() => {
                          if (isCurrentUser) {
                            setSelectedMessageId(msg._id);
                            console.log(selectedMessageId);

                            // Assuming `msg.id` uniquely identifies each message
                          }
                        }}
                        className={`
                  max-w-[70%] 
                  rounded-2xl 
                  p-3 
                  shadow-md 
                  relative 
                  ${
                    isCurrentUser
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "bg-white border border-gray-100"
                  }
                  transform 
                  transition-all 
                  duration-300 
                  hover:scale-[1.02]
                `}
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}
                      >
                        <p className="relative z-10" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {msg.content}
                        </p>
                        <span
                          className={`text-xs block mt-1 text-right ${
                            isCurrentUser ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
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
                })
              )
            ) : (
              " "
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}

        {selectedChat && (
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center space-x-3 bg-white rounded-full p-1 shadow-lg border border-blue-100 hover:border-blue-200 transition-all duration-300">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  console.log(e);

                  if (e.code === "Enter") {
                    e.preventDefault(); // Prevent the default action (like form submission)
                    handleSendMessage(); // Call the send message function
                  }
                }}
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
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerLayout;
