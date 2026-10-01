import { io } from "socket.io-client";
import { create } from "zustand";

import useChatStore from "./chatStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

let socket = null;

const useSocketStore = create((set, get) => ({
  socket: null,

  initializeSocket: (user, logout) => {
    const token = localStorage.getItem("authToken");
    if (!token || !user || socket) return;

    socket = io(backendUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("user-connected", {
        userId: user.id,
        username: user.username,
      });

      set({ socket });
      get().setupSocketListeners();
    });

    socket.on("disconnect", () => {
      logout?.();
      set({ socket: null });
      socket = null;
    });
  },

  disconnectSocket: () => {
    if (!socket) return;

    socket.disconnect();
    socket = null;
    set({ socket: null });
  },

  setupSocketListeners: () => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      const chatStore = useChatStore.getState();

      if (chatStore.selectedChat?.id === message.conversationId) {
        chatStore.setMessages((currentMessages) => [
          ...currentMessages.filter(
            (currentMessage) => currentMessage._id !== message._id
          ),
          message,
        ]);
      }
    };

    const handleNewMessage = ({ conversationId, lastMessage }) => {
      useChatStore.getState().setChats((currentChats) =>
        currentChats
          .map((chat) =>
            chat.id === conversationId
              ? {
                  ...chat,
                  lastMessage: lastMessage.content,
                  time: new Date(lastMessage.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }),
                  sortTimestamp: new Date(lastMessage.timestamp).getTime(),
                }
              : chat
          )
          .sort((a, b) => (b.sortTimestamp || 0) - (a.sortTimestamp || 0))
      );
    };

    const handleStatusResponse = ({ status }) => {
      useChatStore.getState().setParticipantStatus(status);
    };

    const handleUserStatusUpdate = ({ username, status }) => {
      const chatStore = useChatStore.getState();

      if (chatStore.selectedChat?.name === username) {
        chatStore.setParticipantStatus(status);
      }

      chatStore.setChats((currentChats) =>
        currentChats.map((chat) =>
          chat.name === username ? { ...chat, status } : chat
        )
      );
    };

    socket.off("receive-message");
    socket.off("new-message");
    socket.off("status-response");
    socket.off("user-status-update");

    socket.on("receive-message", handleReceiveMessage);
    socket.on("new-message", handleNewMessage);
    socket.on("status-response", handleStatusResponse);
    socket.on("user-status-update", handleUserStatusUpdate);
  },
}));

export const useSocket = () => useSocketStore((state) => state.socket);
export const useInitializeSocket = () =>
  useSocketStore((state) => state.initializeSocket);
export const useDisconnectSocket = () =>
  useSocketStore((state) => state.disconnectSocket);

export default useSocketStore;
