import { create } from "zustand";
import { io } from "socket.io-client";
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
      console.log("Socket connected:", socket.id);
      // emit user-connected with correct payload
      socket.emit("user-connected", {
        userId: user.id,
        username: user.username,
      });
      set({ socket });
      
      // Setup listeners after connection
      get().setupSocketListeners(user);
      
      // Request status for all chat participants after connection
      setTimeout(() => {
        get().requestAllParticipantStatuses();
      }, 1000); // Small delay to ensure server has processed the connection
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      logout?.();
      set({ socket: null });
      socket = null;
    });
  },

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      console.log("Socket disconnected");
      socket = null;
      set({ socket: null });
    }
  },

  getSocket: () => {
    if (!socket) {
      console.warn("Socket is not initialized");
    }
    return socket;
  },

  setupSocketListeners: (user) => {
    if (!socket || !user) return;

    // receive-message event from server matches:
    // { conversationId, senderId, content, senderUsername, timestamp }
    const handleReceiveMessage = (message) => {
      console.log("Received message:", message);
      const selectedChat = useChatStore.getState().selectedChat;
      if (selectedChat?.id === message.conversationId) {
        const currentMessages = useChatStore.getState().messages;
        useChatStore.getState().setMessages([
          ...currentMessages.filter((m) => m._id !== message._id), 
          message
        ]);
      }
    };

    // new-message event: { conversationId, lastMessage: { content, senderId, senderUsername, timestamp } }
    const handleNewMessage = ({ conversationId, lastMessage }) => {
      console.log("New message for chat list:", { conversationId, lastMessage });
      const currentChats = useChatStore.getState().chats;
      const updatedChats = currentChats
        .map((chat) => {
          if (chat.id === conversationId) {
            return {
              ...chat,
              lastMessage: lastMessage.content,
              time: new Date(lastMessage.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              sortTimestamp: new Date(lastMessage.timestamp).getTime(),
            };
          }
          return chat;
        })
        .sort((a, b) => (b.sortTimestamp || 0) - (a.sortTimestamp || 0));
      
      useChatStore.getState().setChats(updatedChats);
    };

    // status-response event: { participantUsername, status }
    const handleStatusResponse = ({ participantUsername, status }) => {
      console.log(`Status response for ${participantUsername}: ${status}`);
      useChatStore.getState().setParticipantStatus(status);
    };

    // user-status-update event: { username, status }
    const handleUserStatusUpdate = ({ username, status }) => {
      console.log(`User ${username} is now ${status}`);
      const selectedChat = useChatStore.getState().selectedChat;
      if (selectedChat?.name === username) {
        useChatStore.getState().setParticipantStatus(status);
      }
      
      const currentChats = useChatStore.getState().chats;
      const updatedChats = currentChats.map((chat) =>
        chat.name === username ? { ...chat, status } : chat
      );
      useChatStore.getState().setChats(updatedChats);
    };

    // Remove existing listeners to avoid duplicates
    socket.off("receive-message");
    socket.off("new-message");
    socket.off("status-response");
    socket.off("user-status-update");

    // Add new listeners
    socket.on("receive-message", handleReceiveMessage);
    socket.on("new-message", handleNewMessage);
    socket.on("status-response", handleStatusResponse);
    socket.on("user-status-update", handleUserStatusUpdate);

    console.log("Socket listeners set up successfully");
  },

  // Request status for all chat participants (call this when chats are loaded)
  requestAllParticipantStatuses: () => {
    const chats = useChatStore.getState().chats;
    if (socket && chats.length > 0) {
      console.log("Requesting status for all participants");
      chats.forEach(chat => {
        if (chat.name) {
          socket.emit("check-status", { participantUsername: chat.name });
        }
      });
    }
  },

  // To request participant status (emit 'check-status' with object)
  requestParticipantStatus: (participantUsername) => {
    if (socket) {
      console.log("Requesting status for:", participantUsername);
      socket.emit("check-status", { participantUsername });
    } else {
      console.warn("Socket not initialized");
    }
  },

  // Optional listener for participant-status if needed
  listenForParticipantStatus: (callback) => {
    if (socket) {
      socket.on("participant-status", callback);
    } else {
      console.warn("Socket not initialized");
    }
  },

  // To send a message with the exact expected server payload
  sendMessage: ({
    senderUsername,
    receiverUsername,
    message,
    conversationId,
    senderId,
    timestamp = new Date().toISOString(),
  }) => {
    if (socket) {
      socket.emit("send-message", {
        senderUsername,
        receiverUsername,
        message,
        conversationId,
        senderId,
        timestamp,
      });
    } else {
      console.warn("Socket not initialized");
    }
  },

  // To manually emit user-disconnected with username string
  disconnectUserManually: (username) => {
    if (socket) {
      socket.emit("user-disconnected", username);
    } else {
      console.warn("Socket not initialized");
    }
  },
}));

export const useSocket = () => useSocketStore((state) => state.socket);
export const useInitializeSocket = () => useSocketStore((state) => state.initializeSocket);
export const useDisconnectSocket = () => useSocketStore((state) => state.disconnectSocket);
export const useGetSocket = () => useSocketStore((state) => state.getSocket);
export const useSetupSocketListeners = () => useSocketStore((state) => state.setupSocketListeners);
export const useRequestAllParticipantStatuses = () => useSocketStore((state) => state.requestAllParticipantStatuses);
export const useRequestParticipantStatus = () => useSocketStore((state) => state.requestParticipantStatus);
export const useListenForParticipantStatus = () => useSocketStore((state) => state.listenForParticipantStatus);
export const useSendMessage = () => useSocketStore((state) => state.sendMessage);
export const useDisconnectUserManually = () => useSocketStore((state) => state.disconnectUserManually);

export default useSocketStore;