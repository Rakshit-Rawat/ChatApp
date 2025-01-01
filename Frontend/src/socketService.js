import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

let socket; // Singleton socket instance

const SOCKET_URL = "http://localhost:5000"; // Replace with your backend URL

// Initialize the socket connection
export const initializeSocket = (token, userId,username,logout) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token }, // Attach token for authentication
      transports: ["websocket"], // Use WebSocket transport for better performance
    });

    // Handle connection
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      // Register user ID on connection
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
    socket = null; // Clear the socket instance
  }
};
