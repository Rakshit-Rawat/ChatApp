  import { useCallback } from "react";
  import axios from "axios";
  import { useSocket } from "@/stores/socketStore";

  const useChatHandlers = ({
    user,
    
    selectedChat,
    setMessages,
    setChats,
    setMessagesLoading,
    setSelectedChat,
    setSelectedMessageIds,
    setShowDeleteConfirmation,
    triggerChatRefresh,
  }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const socket=useSocket()

    const handleChatSelect = useCallback(
    async (chat) => {
      setSelectedChat((prevChat) => ({
        ...chat,
        user: prevChat?.user || user,
      }));

      setMessagesLoading(true);

      // Ensure socket is initialized before emitting
      if (socket) {
        socket.emit("check-status", { participantUsername: chat.name });
      } else {
        console.error("Socket not initialized");
      }

      try {
        const res = await axios.get(`${backendUrl}/api/messages/${chat.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setMessagesLoading(false);
      }
    },
    [user, socket, setMessages, setSelectedChat, setMessagesLoading]
  );


    const handleSendMessage = useCallback(
      async (newMessage, setNewMessage) => {
        if (!newMessage.trim() || !selectedChat || !user?.username) return;

        const recipient = selectedChat.participants.find(
          (p) => p.username !== user.username
        );
        if (!recipient) return;

        const timestamp = new Date();
        const iso = timestamp.toISOString();
        const formatted = timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const messageData = {
          conversationId: selectedChat.id,
          senderId: user.id,
          senderUsername: user.username,
          receiverId: recipient._id,
          receiverUsername: recipient.username,
          content: newMessage,
          timestamp: iso,
        };

        const tempMessage = { ...messageData, _id: `temp-${Date.now()}` };

        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage("");

        try {
          const { data: savedMessage } = await axios.post(
            `${backendUrl}/api/messages`,
            messageData,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          socket.emit("send-message", {
            ...messageData,
            message: newMessage,
          });

          setMessages((prev) =>
            prev.map((msg) => (msg._id === tempMessage._id ? savedMessage : msg))
          );

          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === selectedChat.id
                ? { ...chat, lastMessage: newMessage, time: formatted }
                : chat
            )
          );
        } catch (error) {
          console.error("Message failed:", error);
          setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
        }
      },
      [selectedChat, user, socket, setMessages, setChats,triggerChatRefresh]
    );

    const toggleMessageSelection = useCallback(
      (id) => {
        setSelectedMessageIds((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
      },
      [setSelectedMessageIds]
    );

    const clearSelection = useCallback(() => {
      setSelectedMessageIds([]);
    }, [setSelectedMessageIds]);

    const handleDeleteMessages = useCallback(() => {
      setShowDeleteConfirmation(true);
    }, [setShowDeleteConfirmation]);

    return {
      handleChatSelect,
      handleSendMessage,
      toggleMessageSelection,
      clearSelection,
      handleDeleteMessages,
    };
  };

  export default useChatHandlers;
