import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { initializeSocket, disconnectSocket } from "../socketService";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null); 
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isChatRoute = location.pathname === "/chat";

    if (isChatRoute && token && !socket) {
      const newSocket = initializeSocket(
        token,
        user?.id,
        user?.username,
        logout
      );
      setSocket(newSocket); 
    }

    const handleTabClose = () => {
      if (socket) {
        disconnectSocket();
        logout();
      }
    };

    window.removeEventListener("beforeunload", handleTabClose);
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
      if (!isChatRoute && socket) {
        console.log("Disconnecting socket...");
        disconnectSocket();
        setSocket(null); 
      }
    };
  }, [location.pathname, user, socket, logout]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
