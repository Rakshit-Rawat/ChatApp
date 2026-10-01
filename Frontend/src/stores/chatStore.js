import axios from "axios";
import { create } from "zustand";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const useChatStore = create((set, get) => ({
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

  setSelectedChat: (selectedChat) => set({ selectedChat }),
  setChats: (chats) =>
    set((state) => ({
      chats: typeof chats === "function" ? chats(state.chats) : chats,
    })),
  setMessages: (messages) =>
    set((state) => ({
      messages:
        typeof messages === "function" ? messages(state.messages) : messages,
    })),
  setParticipantStatus: (participantStatus) => set({ participantStatus }),
  setLoadingChats: (loadingChats) => set({ loadingChats }),
  setMessagesLoading: (messagesLoading) => set({ messagesLoading }),
  setNewMessage: (newMessage) => set({ newMessage }),
  setSelectedMessageIds: (selectedMessageIds) => set({ selectedMessageIds }),
  setShowDeleteConfirmation: (showDeleteConfirmation) =>
    set({ showDeleteConfirmation }),

  triggerChatRefresh: () =>
    set((state) => ({ refreshChats: state.refreshChats + 1 })),

  handleChatSelect: async (chat, user, socket) => {
    set({
      selectedChat: chat,
      messagesLoading: true,
      selectedMessageIds: [],
    });

    if (socket) {
      socket.emit("check-status", { participantUsername: chat.name });
    }

    try {
      const response = await axios.get(`${backendUrl}/api/messages/${chat.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      set({ messages: response.data });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      set({ messages: [] });
    } finally {
      set({ messagesLoading: false });
    }
  },

  handleSendMessage: async (user, socket) => {
    const { newMessage, selectedChat, messages, chats } = get();
    const content = newMessage.trim();

    if (!content || !selectedChat || !user?.username) return;

    const recipient = selectedChat.participants?.find(
      (participant) => participant.username !== user.username
    );
    if (!recipient) return;

    const timestamp = new Date();
    const messageData = {
      conversationId: selectedChat.id,
      senderId: user.id,
      senderUsername: user.username,
      receiverId: recipient._id,
      receiverUsername: recipient.username,
      content,
      timestamp: timestamp.toISOString(),
    };
    const tempMessage = {
      ...messageData,
      _id: `temp-${Date.now()}`,
    };

    set({
      messages: [...messages, tempMessage],
      newMessage: "",
    });

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

      if (socket) {
        socket.emit("send-message", {
          ...messageData,
          message: content,
        });
      }

      const formattedTime = timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      set({
        messages: get().messages.map((message) =>
          message._id === tempMessage._id ? savedMessage : message
        ),
        chats: chats
          .map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  lastMessage: content,
                  time: formattedTime,
                  sortTimestamp: timestamp.getTime(),
                }
              : chat
          )
          .sort((a, b) => (b.sortTimestamp || 0) - (a.sortTimestamp || 0)),
      });
    } catch (error) {
      console.error("Message failed:", error);
      set({
        messages: get().messages.filter(
          (message) => message._id !== tempMessage._id
        ),
      });
    }
  },

  toggleMessageSelection: (id) =>
    set((state) => ({
      selectedMessageIds: state.selectedMessageIds.includes(id)
        ? state.selectedMessageIds.filter((messageId) => messageId !== id)
        : [...state.selectedMessageIds, id],
    })),

  clearSelection: () => set({ selectedMessageIds: [] }),
  handleDeleteMessages: () => set({ showDeleteConfirmation: true }),

  confirmDeleteMessages: async () => {
    const {
      selectedMessageIds,
      selectedChat,
      messages,
      chats,
      triggerChatRefresh,
    } = get();

    if (selectedMessageIds.length === 0) return;

    const idsToDelete = [...selectedMessageIds];
    const previousMessages = [...messages];
    const previousChats = [...chats];
    const remainingMessages = messages.filter(
      (message) => !idsToDelete.includes(message._id)
    );
    const latestMessage = [...remainingMessages].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )[0];

    set({
      showDeleteConfirmation: false,
      selectedMessageIds: [],
      messages: remainingMessages,
      chats: selectedChat
        ? chats.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  lastMessage: latestMessage?.content || "No messages",
                  time: latestMessage?.timestamp
                    ? new Date(latestMessage.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "",
                }
              : chat
          )
        : chats,
    });

    try {
      await axios.delete(`${backendUrl}/api/messages/bulk-delete`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        data: { messageIds: idsToDelete },
      });

      triggerChatRefresh();
    } catch (error) {
      console.error("Error deleting messages:", error);
      set({
        messages: previousMessages,
        chats: previousChats,
      });
    }
  },

  cleanup: () =>
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
    }),
}));

export const useSelectedChat = () =>
  useChatStore((state) => state.selectedChat);
export const useChats = () => useChatStore((state) => state.chats);
export const useMessages = () => useChatStore((state) => state.messages);
export const useParticipantStatus = () =>
  useChatStore((state) => state.participantStatus);
export const useLoadingChats = () =>
  useChatStore((state) => state.loadingChats);
export const useMessagesLoading = () =>
  useChatStore((state) => state.messagesLoading);
export const useNewMessage = () => useChatStore((state) => state.newMessage);
export const useSelectedMessageIds = () =>
  useChatStore((state) => state.selectedMessageIds);
export const useShowDeleteConfirmation = () =>
  useChatStore((state) => state.showDeleteConfirmation);
export const useRefreshChats = () =>
  useChatStore((state) => state.refreshChats);

export const useSetSelectedChat = () =>
  useChatStore((state) => state.setSelectedChat);
export const useSetChats = () => useChatStore((state) => state.setChats);
export const useSetMessages = () => useChatStore((state) => state.setMessages);
export const useSetParticipantStatus = () =>
  useChatStore((state) => state.setParticipantStatus);
export const useSetLoadingChats = () =>
  useChatStore((state) => state.setLoadingChats);
export const useSetMessagesLoading = () =>
  useChatStore((state) => state.setMessagesLoading);
export const useSetNewMessage = () =>
  useChatStore((state) => state.setNewMessage);
export const useSetSelectedMessageIds = () =>
  useChatStore((state) => state.setSelectedMessageIds);
export const useSetShowDeleteConfirmation = () =>
  useChatStore((state) => state.setShowDeleteConfirmation);
export const useTriggerChatRefresh = () =>
  useChatStore((state) => state.triggerChatRefresh);

export const useHandleChatSelect = () =>
  useChatStore((state) => state.handleChatSelect);
export const useHandleSendMessage = () =>
  useChatStore((state) => state.handleSendMessage);
export const useToggleMessageSelection = () =>
  useChatStore((state) => state.toggleMessageSelection);
export const useClearSelection = () =>
  useChatStore((state) => state.clearSelection);
export const useHandleDeleteMessages = () =>
  useChatStore((state) => state.handleDeleteMessages);
export const useConfirmDeleteMessages = () =>
  useChatStore((state) => state.confirmDeleteMessages);
export const useChatCleanup = () => useChatStore((state) => state.cleanup);

export default useChatStore;
