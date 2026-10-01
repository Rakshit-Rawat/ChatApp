import { useEffect } from "react";
import { useLocation } from "react-router";

import {
  useAuthUser,
  useInitializeAuth,
  useLogout,
} from "./stores/authStore";
import {
  useDisconnectSocket,
  useInitializeSocket,
  useSocket,
} from "./stores/socketStore";

const SocketManager = () => {
  const location = useLocation();
  const initializeSocket = useInitializeSocket();
  const disconnectSocket = useDisconnectSocket();
  const socket = useSocket();
  const user = useAuthUser();
  const logout = useLogout();
  const initializeAuth = useInitializeAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isChatRoute = location.pathname === "/chat";

    if (isChatRoute && token && user && !socket) {
      initializeSocket(user, logout);
      return;
    }

    if (!isChatRoute && socket) {
      disconnectSocket();
    }
  }, [
    disconnectSocket,
    initializeSocket,
    location.pathname,
    logout,
    socket,
    user,
  ]);

  useEffect(() => {
    const handleTabClose = () => {
      if (socket) {
        disconnectSocket();
      }
    };

    window.addEventListener("beforeunload", handleTabClose);
    return () => window.removeEventListener("beforeunload", handleTabClose);
  }, [disconnectSocket, socket]);

  return null;
};

export default SocketManager;
