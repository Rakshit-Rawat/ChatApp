// stores/socketStore.js
import { create } from "zustand";
import { io } from "socket.io-client";

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
      socket.emit("user-connected", {
        userId: user.id,
        username: user.username,
      });
      set({ socket });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      logout?.(); // optional logout callback
      set({ socket: null });
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

  listenForParticipantStatus: (callback) => {
    if (socket) {
      socket.on("participant-status", callback);
    } else {
      console.warn("Socket not initialized");
    }
  },

  requestParticipantStatus: (participantUsername) => {
    if (socket) {
      socket.emit("check-participant-status", participantUsername);
    } else {
      console.warn("Socket not initialized");
    }
  },
}));

// Named hooks just like authStore:
export const useSocket = () => useSocketStore((state) => state.socket);
export const useInitializeSocket = () =>
  useSocketStore((state) => state.initializeSocket);
export const useDisconnectSocket = () =>
  useSocketStore((state) => state.disconnectSocket);
export const useGetSocket = () => useSocketStore((state) => state.getSocket);
export const useListenForParticipantStatus = () =>
  useSocketStore((state) => state.listenForParticipantStatus);
export const useRequestParticipantStatus = () =>
  useSocketStore((state) => state.requestParticipantStatus);

