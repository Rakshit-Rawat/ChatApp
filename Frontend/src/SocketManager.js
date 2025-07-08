import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSocket, useInitializeSocket, useDisconnectSocket } from "./stores/socketStore";
import { useAuthUser, useLogout, useInitializeAuth } from "./stores/authStore";

const SocketManager = () => {
  const location = useLocation();
  const initializeSocket = useInitializeSocket();
  const disconnectSocket = useDisconnectSocket();
  const socket = useSocket();
  const user = useAuthUser();
  const logout = useLogout();
  const initializeAuth = useInitializeAuth();

  // Initialize auth for current tab on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isChatRoute = location.pathname === "/chat";

    if (isChatRoute && token && user && !socket) {
      initializeSocket(user, logout);  
    }

    return () => {
      if (!isChatRoute && socket) {
        disconnectSocket();
      }
    };
  }, [location.pathname, socket, initializeSocket, disconnectSocket, user, logout]);

  useEffect(() => {
    const handleTabClose = () => {
      if (socket) {
        disconnectSocket();
      }
    };
    
    window.addEventListener("beforeunload", handleTabClose);
    
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [socket, disconnectSocket]);

  return null; 
};

export default SocketManager;