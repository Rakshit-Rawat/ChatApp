import { create } from "zustand";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const useChatStore = create((set, get) => ({
  // State
  selectedChat: null,
  chats: [],
  messages: [],
  participantStatus: "",
  loadingChats: true,
  messagesLoading: false,
  newMessage: "",
  selectedMessageIds: [],
  showDeleteConfirmation: false,
  refreshChats: 0,

  // Actions
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  setChats: (chats) => set({ chats }),
  setMessages: (messages) => set({ messages }),
  setParticipantStatus: (status) => {
      console.log("Setting participantStatus:", status);
    set({ participantStatus: status })},

  setLoadingChats: (loading) => set({ loadingChats: loading }),
  setMessagesLoading: (loading) => set({ messagesLoading: loading }),
  setNewMessage: (message) => set({ newMessage: message }),
  setSelectedMessageIds: (ids) => set({ selectedMessageIds: ids }),
  setShowDeleteConfirmation: (show) => set({ showDeleteConfirmation: show }),

  // Trigger chat refresh
  triggerChatRefresh: () => {
    set((state) => ({ refreshChats: state.refreshChats + 1 }));
  },

  // Chat Handlers
  handleChatSelect: async (chat, user, socket) => {
    const { setSelectedChat, setMessagesLoading, setMessages } = get();
    
    setSelectedChat({
      ...chat,
      user: get().selectedChat?.user || user,
    });

    setMessagesLoading(true);

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

  handleSendMessage: async (user, socket) => {
    const { 
      newMessage, 
      selectedChat, 
      setMessages, 
      setNewMessage, 
      setChats,
      triggerChatRefresh 
    } = get();

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

    setMessages([...get().messages, tempMessage]);
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

      setMessages(
        get().messages.map((msg) => 
          msg._id === tempMessage._id ? savedMessage : msg
        )
      );

      setChats(
        get().chats.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, lastMessage: newMessage, time: formatted }
            : chat
        )
      );
    } catch (error) {
      console.error("Message failed:", error);
      setMessages(get().messages.filter((m) => m._id !== tempMessage._id));
    }
  },

  toggleMessageSelection: (id) => {
    const { selectedMessageIds, setSelectedMessageIds } = get();
    const newIds = selectedMessageIds.includes(id)
      ? selectedMessageIds.filter((x) => x !== id)
      : [...selectedMessageIds, id];
    setSelectedMessageIds(newIds);
  },

  clearSelection: () => {
    set({ selectedMessageIds: [] });
  },

  handleDeleteMessages: () => {
    set({ showDeleteConfirmation: true });
  },

  confirmDeleteMessages: async () => {
    const { 
      selectedMessageIds, 
      selectedChat, 
      messages, 
      setMessages, 
      setChats,
      setSelectedMessageIds,
      setShowDeleteConfirmation,
      triggerChatRefresh 
    } = get();

    if (selectedMessageIds.length === 0) return;

    setShowDeleteConfirmation(false);

    try {
      const idsToDelete = [...selectedMessageIds];
      setSelectedMessageIds([]);

      setMessages(
        messages.filter((msg) => !idsToDelete.includes(msg._id))
      );

      if (selectedChat) {
        const remainingMessages = messages.filter(
          (msg) => !idsToDelete.includes(msg._id)
        );

        const sortedMessages = [...remainingMessages].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        const newLastMessage =
          sortedMessages.length > 0
            ? sortedMessages[0]
            : { content: "No messages", timestamp: new Date() };

        setChats(
          get().chats.map((chat) => {
            if (chat.id === selectedChat.id) {
              return {
                ...chat,
                lastMessage: newLastMessage.content,
                time: new Date(newLastMessage.timestamp).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }
                ),
              };
            }
            return chat;
          })
        );

        await get().deleteMessagesApi(idsToDelete);

        if (sortedMessages.length > 0) {
          const latestMsg = sortedMessages[0];
          await axios.patch(
            `${backendUrl}/api/conversation/${selectedChat.id}`,
            {
              lastMessage: {
                content: latestMsg.content,
                senderId: latestMsg.senderId,
                senderUsername: latestMsg.senderUsername,
                timestamp: latestMsg.timestamp,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
        }

        triggerChatRefresh();
      } else {
        await get().deleteMessagesApi(idsToDelete);
      }
    } catch (error) {
      console.error("Error while deleting messages:", error);
    }
  },

  deleteMessagesApi: async (messageIds) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/messages/bulk-delete`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          data: { messageIds },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting messages:", error);
      throw error;
    }
  },

  // Cleanup
  cleanup: () => {
    set({
      selectedChat: null,
      chats: [],
      messages: [],
      participantStatus: "offline",
      loadingChats: true,
      messagesLoading: false,
      newMessage: "",
      selectedMessageIds: [],
      showDeleteConfirmation: false,
      refreshChats: 0,
    });
  },
}));

// Named export hooks
export const useSelectedChat = () => useChatStore((state) => state.selectedChat);
export const useChats = () => useChatStore((state) => state.chats);
export const useMessages = () => useChatStore((state) => state.messages);
export const useParticipantStatus = () => useChatStore((state) => state.participantStatus);
export const useLoadingChats = () => useChatStore((state) => state.loadingChats);
export const useMessagesLoading = () => useChatStore((state) => state.messagesLoading);
export const useNewMessage = () => useChatStore((state) => state.newMessage);
export const useSelectedMessageIds = () => useChatStore((state) => state.selectedMessageIds);
export const useShowDeleteConfirmation = () => useChatStore((state) => state.showDeleteConfirmation);
export const useRefreshChats = () => useChatStore((state) => state.refreshChats);

// Action hooks
export const useSetSelectedChat = () => useChatStore((state) => state.setSelectedChat);
export const useSetChats = () => useChatStore((state) => state.setChats);
export const useSetMessages = () => useChatStore((state) => state.setMessages);
export const useSetParticipantStatus = () => useChatStore((state) => state.setParticipantStatus);
export const useSetLoadingChats = () => useChatStore((state) => state.setLoadingChats);
export const useSetMessagesLoading = () => useChatStore((state) => state.setMessagesLoading);
export const useSetNewMessage = () => useChatStore((state) => state.setNewMessage);
export const useSetSelectedMessageIds = () => useChatStore((state) => state.setSelectedMessageIds);
export const useSetShowDeleteConfirmation = () => useChatStore((state) => state.setShowDeleteConfirmation);
export const useTriggerChatRefresh = () => useChatStore((state) => state.triggerChatRefresh);

// Handler hooks
export const useHandleChatSelect = () => useChatStore((state) => state.handleChatSelect);
export const useHandleSendMessage = () => useChatStore((state) => state.handleSendMessage);
export const useToggleMessageSelection = () => useChatStore((state) => state.toggleMessageSelection);
export const useClearSelection = () => useChatStore((state) => state.clearSelection);
export const useHandleDeleteMessages = () => useChatStore((state) => state.handleDeleteMessages);
export const useConfirmDeleteMessages = () => useChatStore((state) => state.confirmDeleteMessages);
export const useChatCleanup = () => useChatStore((state) => state.cleanup);

export default useChatStore;
