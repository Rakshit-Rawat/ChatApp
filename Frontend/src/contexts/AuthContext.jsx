import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const backendUrl=import.meta.env.VITE_BACKEND_URL

  const [user, setUser] = useState(() => {
    // Get all stored users
    const storedUsers = JSON.parse(localStorage.getItem("storedUsers") || "{}");

    // Get the current tab/window ID
    const currentTabId = sessionStorage.getItem("tabId");

    // If we have a tab-specific user, return it
    if (currentTabId && storedUsers[currentTabId]) {
      return storedUsers[currentTabId];
    }
    
    
    // Fallback to the last logged-in user if no tab-specific user
    return null;
  });
  // return currentTabId && storedUsers[currentTabId] ? storedUsers[currentTabId] : null;

  const navigate = useNavigate();

  // Generate a unique tab ID if not exists
  useEffect(() => {
    if (!sessionStorage.getItem("tabId")) {
      sessionStorage.setItem("tabId", Date.now().toString());
    }
  }, []);

  useEffect(() => {
    const currentTabId = sessionStorage.getItem("tabId");

    if (user) {
      // Retrieve existing stored users
      const storedUsers = JSON.parse(
        localStorage.getItem("storedUsers") || "{}"
      );

      // Update the user for this specific tab
      storedUsers[currentTabId] = user;

      // Save updated stored users
      localStorage.setItem("storedUsers", JSON.stringify(storedUsers));

      // Set axios header
      const token = localStorage.getItem("authToken");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    } else {
      // Remove user for this tab
      const storedUsers = JSON.parse(
        localStorage.getItem("storedUsers") || "{}"
      );
      delete storedUsers[currentTabId];
      localStorage.setItem("storedUsers", JSON.stringify(storedUsers));
    }
  }, [user]);

  // useEffect(() => {
  //   socket.on("disconnect", () => {
  //     console.log("Socket disconnected. Logging out...");
  //     logout(); // Call logout function on disconnect
  //   });

  //   return () => {
  //     socket.off("disconnect"); // Cleanup listener on unmount
  //   };
  // }, []);


  const login = async (credentials) => {
    try {
      const response = await axios.post(
        `${backendUrl}/auth/login`,
        credentials,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const token = response.data.TOKEN;
        localStorage.setItem("authToken", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const userData = response.data.user;
        const currentTabId = sessionStorage.getItem("tabId");

        // Retrieve and update stored users
        const storedUsers = JSON.parse(
          localStorage.getItem("storedUsers") || "{}"
        );
        storedUsers[currentTabId] = userData;
        localStorage.setItem("storedUsers", JSON.stringify(storedUsers));
        console.log("user", userData);
        setUser(userData);

        return { success: true, data: response.data };
      }
      return { success: false, message: "Login failed." };
    } catch (error) {
      const message = error.response?.data?.error || "Login failed.";
      return { success: false, message };
    }
  };

  const logout = async () => {
    const currentTabId = sessionStorage.getItem("tabId");

    const userId = user?.id;
    const username = user?.username;

    try {
      await axios.post(
        `${backendUrl}/auth/logout`,
        { userId, username },
        {
          withCredentials: true,
        }
      );

      // Remove user for this specific tab
      const storedUsers = JSON.parse(
        localStorage.getItem("storedUsers") || "{}"
      );
      delete storedUsers[currentTabId];
      localStorage.setItem("storedUsers", JSON.stringify(storedUsers));

      setUser(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("storeUsers");
      delete axios.defaults.headers.common["Authorization"];
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(
        "Logout failed:",
        error.response?.data?.error || "An error occurred during logout."
      );
      
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
