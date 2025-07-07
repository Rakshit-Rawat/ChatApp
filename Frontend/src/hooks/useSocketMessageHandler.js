import { useEffect } from "react";
import { useSocket } from "@/stores/socketStore";
import { useAuthUser } from "@/stores/authStore";

const useSocketMessageHandler = ({
  selectedChat,
  setMessages,
  setChats,
  setParticipantStatus,
}) => {
  const socket = useSocket();
  const user = useAuthUser();
  useEffect(() => {
    if (!socket || !user) return;

    // Real-time message handler for messages in the open chat
    const handleReceiveMessage = (message) => {
      console.log("Received message:", message);
      if (selectedChat?.id === message.conversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some((msg) => msg._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    //  Enhanced chat list update with better sorting
    const handleNewMessage = ({ conversationId, lastMessage }) => {
      console.log("New message for chat list:", {
        conversationId,
        lastMessage,
      });

      setChats((prevChats) => {
        // Check if this conversation already exists in the chat list
        const existingChatIndex = prevChats.findIndex(
          (chat) => chat.id === conversationId
        );

        if (existingChatIndex !== -1) {
          // Update existing chat
          const updatedChats = [...prevChats];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            lastMessage: lastMessage.content,
            time: new Date(lastMessage.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            sortTimestamp: new Date(lastMessage.timestamp).getTime(),
          };

          // Sort by most recent message first
          return updatedChats.sort((a, b) => {
            const timeA =
              a.sortTimestamp || new Date(a.time || 0).getTime() || 0;
            const timeB =
              b.sortTimestamp || new Date(b.time || 0).getTime() || 0;
            return timeB - timeA;
          });
        }

        // If chat doesn't exist, we might need to refetch the chat list
        // This can happen when a new conversation is created
        return prevChats;
      });
    };

    // Status update handler
    const handleStatusResponse = ({ participantUsername, status }) => {
      console.log(`Status for ${participantUsername}: ${status}`);
      setParticipantStatus(status);
    };

    const handleUserStatusUpdate = ({ username, status }) => {
      console.log(`User ${username} is now ${status}`);
      if (selectedChat?.name === username) {
        setParticipantStatus(status);
      }
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("new-message", handleNewMessage);
    socket.on("status-response", handleStatusResponse);
    socket.on("user-status-update", handleUserStatusUpdate);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("new-message", handleNewMessage);
      socket.off("status-response", handleStatusResponse);
      socket.off("user-status-update", handleUserStatusUpdate);
    };
  }, [socket, user, selectedChat, setMessages, setChats, setParticipantStatus]);
};

export default useSocketMessageHandler;
