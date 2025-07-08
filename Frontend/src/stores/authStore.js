import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Generate or get tab ID
const getTabId = () => {
  let tabId = sessionStorage.getItem("tabId");
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("tabId", tabId);
  }
  return tabId;
};

// Custom storage that uses tab-specific keys
const createTabSpecificStorage = () => {
  const tabId = getTabId();
  
  return {
    getItem: (name) => {
      const item = localStorage.getItem(`${name}_${tabId}`);
      return item;
    },
    setItem: (name, value) => {
      localStorage.setItem(`${name}_${tabId}`, value);
    },
    removeItem: (name) => {
      localStorage.removeItem(`${name}_${tabId}`);
    },
  };
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user) => {
        set({ user });

        const currentTabId = getTabId();
        const storedUsers = JSON.parse(
          localStorage.getItem("storedUsers") || "{}"
        );

        if (user) {
          storedUsers[currentTabId] = user;
        } else {
          delete storedUsers[currentTabId];
        }

        localStorage.setItem("storedUsers", JSON.stringify(storedUsers));

        // Handle global auth token (shared for socket connections)
        const token = localStorage.getItem("authToken");
        
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          delete axios.defaults.headers.common["Authorization"];
        }
      },

      login: async (credentials) => {
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
            
            // Store token globally (shared across tabs for socket connection)
            localStorage.setItem("authToken", token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const userData = response.data.user;
            get().setUser(userData);

            return { success: true, data: response.data };
          }

          return { success: false, message: "Login failed." };
        } catch (error) {
          const message = error.response?.data?.error || "Login failed.";
          return { success: false, message };
        }
      },

      logout: async () => {
        const currentTabId = getTabId();
        const user = get().user;

        try {
          await axios.post(
            `${backendUrl}/auth/logout`,
            { userId: user?.id, username: user?.username },
            { withCredentials: true }
          );

          const storedUsers = JSON.parse(
            localStorage.getItem("storedUsers") || "{}"
          );
          delete storedUsers[currentTabId];
          localStorage.setItem("storedUsers", JSON.stringify(storedUsers));

          // Only remove global token if no other tabs have users
          const remainingUsers = Object.keys(storedUsers).length;
          if (remainingUsers === 0) {
            localStorage.removeItem("authToken");
            delete axios.defaults.headers.common["Authorization"];
          }

          set({ user: null });
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },

      // Initialize auth state for current tab
      initializeAuth: () => {
        const token = localStorage.getItem("authToken");
        
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createTabSpecificStorage(),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Initialize auth on store creation
useAuthStore.getState().initializeAuth();

export const useAuthUser = () => {
  const user = useAuthStore((state) => state.user);
  return user;
};

export const useSetUser = () => {
  const setUser = useAuthStore((state) => state.setUser); 
  return setUser;
};

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);
  const handleLogin = async (credentials) => {
    const response = await login(credentials);
    return response;
  };
  return handleLogin;
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout(); 
  };

  return handleLogout;
};

export const useInitializeAuth = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  return initializeAuth;
};

export default useAuthStore;