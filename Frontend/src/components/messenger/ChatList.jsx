import { useEffect, useCallback } from "react";
import axios from "axios";

import ChatItem from "./ChatItem";
import LoadingSpinner from "../ui/LoadingSpinner";
import EmptyState from "../ui/EmptyState";

import {
  useChats,
  useSetChats,
  useLoadingChats,
  useSetLoadingChats,
  useHandleChatSelect,
  useRefreshChats,
} from "../../stores/chatStore";
import { useSocket } from "../../stores/socketStore";
import { useAuthUser } from "../../stores/authStore";


const ChatList = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const chats = useChats();
  const setChats = useSetChats();
  const loadingChats = useLoadingChats();
  const setLoadingChats = useSetLoadingChats();
  const handleChatSelect = useHandleChatSelect();
  const refreshChats = useRefreshChats();
  const user=useAuthUser()
  
  const socket=useSocket()

  const fetchChats = useCallback(async () => {
    if (!user?.username) return;

    try {
      setLoadingChats(true);

      const response = await axios.get(
        `${backendUrl}/api/conversation/${user.username}`,
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
          sortTimestamp: chat.lastMessage?.timestamp
            ? new Date(chat.lastMessage.timestamp).getTime()
            : 0,
        };
      });

      const sortedChats = fetchedChats.sort(
        (a, b) => b.sortTimestamp - a.sortTimestamp
      );

      setChats(sortedChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoadingChats(false);
    }
  }, [user?.username, backendUrl, setChats, setLoadingChats]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats, refreshChats]);

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
          onClick={() => handleChatSelect(chat, user,socket)}
        />
      ))}
    </div>
  );
};

export default ChatList;
