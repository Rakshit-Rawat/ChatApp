import { useEffect } from "react";
import axios from "axios";
import ChatItem from "./ChatItem";
import LoadingSpinner from "../ui/LoadingSpinner";
import EmptyState from "../ui/EmptyState";

const ChatList = ({
  chats,
  setChats,
  handleChatSelect,
  setLoadingChats,
  loadingChats,
  user,
  refreshChats,
}) => {
  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.username) return;

      try {
        setLoadingChats(true);
        const response = await axios.get(
          `https://chatapp-oq5w.onrender.com/api/conversation/${user.username}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        console.log(response);

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
        if (error.response?.status === 401) handleLogout();
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, [user, refreshChats]);

  if (loadingChats) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <LoadingSpinner message="Loading Chats..." />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <EmptyState
          icon="chat"
          title="No Chats Available"
          description="Start a conversation to see it here."
          buttonText="New Chat"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          onClick={() => handleChatSelect(chat)}
        />
      ))}
    </div>
  );
};

export default ChatList;
