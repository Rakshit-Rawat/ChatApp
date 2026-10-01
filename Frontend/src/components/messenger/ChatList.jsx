import { useCallback, useEffect } from "react";
import axios from "axios";

import { useAuthUser } from "../../stores/authStore";
import {
  useChats,
  useHandleChatSelect,
  useLoadingChats,
  useRefreshChats,
  useSetChats,
  useSetLoadingChats,
} from "../../stores/chatStore";
import { useSocket } from "../../stores/socketStore";
import EmptyState from "../ui/EmptyState";
import LoadingSpinner from "../ui/LoadingSpinner";
import ChatItem from "./ChatItem";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ChatList = () => {
  const chats = useChats();
  const setChats = useSetChats();
  const loadingChats = useLoadingChats();
  const setLoadingChats = useSetLoadingChats();
  const handleChatSelect = useHandleChatSelect();
  const refreshChats = useRefreshChats();
  const user = useAuthUser();
  const socket = useSocket();

  const username = user?.username;

  const fetchChats = useCallback(async () => {
    if (!username) return;

    setLoadingChats(true);

    try {
      const response = await axios.get(
        `${backendUrl}/api/conversation/${username}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );

      const fetchedChats = response.data
        .map((chat) => {
          const otherParticipant = chat.participants?.find(
            (participant) => participant.username !== username,
          );
          const timestamp = chat.lastMessage?.timestamp;

          return {
            id: chat._id,
            name: otherParticipant?.username,
            avatar: otherParticipant?.avatar,
            lastMessage: chat.lastMessage?.content || "Start a conversation",
            time: timestamp
              ? new Date(timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "",
            participants: chat.participants,
            sortTimestamp: timestamp ? new Date(timestamp).getTime() : 0,
          };
        })
        .filter((chat) => chat.name)
        .sort((a, b) => b.sortTimestamp - a.sortTimestamp);

      setChats(fetchedChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoadingChats(false);
    }
  }, [setChats, setLoadingChats, username]);

  useEffect(() => {
    void fetchChats();
  }, [fetchChats, refreshChats]);

  if (loadingChats) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <LoadingSpinner message="Loading chats..." />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <EmptyState
          title="No Chats Available"
          description="Search for a user above to start a conversation."
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
          onClick={() => handleChatSelect(chat, user, socket)}
        />
      ))}
    </div>
  );
};

export default ChatList;
