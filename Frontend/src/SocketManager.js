import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSocket,useInitializeSocket,useDisconnectSocket } from "./stores/socketStore"
import { useAuthUser, useLogout } from "./stores/authStore";

const SocketManager = () => {
  const location = useLocation();
  const initializeSocket = useInitializeSocket((s) => s.initializeSocket);
  const disconnectSocket = useDisconnectSocket((s) => s.disconnectSocket);
  const socket = useSocket((s) => s.socket);
  const user = useAuthUser();
  const logout = useLogout();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isChatRoute = location.pathname === "/chat";

    if (isChatRoute && token && !socket) {
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
