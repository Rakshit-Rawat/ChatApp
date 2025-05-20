import { io } from "socket.io-client";

// Singleton socket instance
let socket; 
const backendUrl=import.meta.env.VITE_BACKEND_URL

const SOCKET_URL = backendUrl; 

// Initialize the socket connection
export const initializeSocket = (token, userId,username,logout) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token }, 
      transports: ["websocket"], 
    });

    // Handle connection
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("user-connected", {userId,username});

    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      logout();
    });
  }
  return socket;
};

// Retrieve the current socket instance
export const getSocket = () => {
  if (!socket) {
    console.error("Socket is not initialized yet");
  }
  return socket;
};

// Listen for participant status updates
export const listenForParticipantStatus = (callback) => {
  if (socket) {
    socket.on("participant-status", callback);
  } else {
    console.error("Socket is not initialized yet");
  }
};

// Request the participant’s status
export const requestParticipantStatus = (participantUsername) => {
  if (socket) {
    socket.emit("check-participant-status", participantUsername);
  } else {
    console.error("Socket is not initialized yet");
  }
};


// Disconnect the socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log("Socket disconnected");
    socket = null; 
  }
};
