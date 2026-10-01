import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const getTabId = () => {
  let tabId = sessionStorage.getItem("tabId");

  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem("tabId", tabId);
  }

  return tabId;
};

const getStoredUsers = () =>
  JSON.parse(localStorage.getItem("storedUsers") || "{}");

const setAuthorizationHeader = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

const createTabSpecificStorage = () => {
  const tabId = getTabId();

  return {
    getItem: (name) => localStorage.getItem(`${name}_${tabId}`),
    setItem: (name, value) => localStorage.setItem(`${name}_${tabId}`, value),
    removeItem: (name) => localStorage.removeItem(`${name}_${tabId}`),
  };
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user) => {
        set({ user });

        const tabId = getTabId();
        const storedUsers = getStoredUsers();

        if (user) {
          storedUsers[tabId] = user;
        } else {
          delete storedUsers[tabId];
        }

        localStorage.setItem("storedUsers", JSON.stringify(storedUsers));
        setAuthorizationHeader(localStorage.getItem("authToken"));
      },

      register: async (account) => {
        try {
          const response = await axios.post(`${backendUrl}/auth/register`, account, {
            withCredentials: true,
          });

          return response.data.success
            ? { success: true, data: response.data }
            : { success: false, message: "Registration failed." };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.error || "Registration failed.",
          };
        }
      },

      login: async (credentials) => {
        try {
          const response = await axios.post(
            `${backendUrl}/auth/login`,
            credentials,
            { withCredentials: true }
          );

          if (!response.data.success) {
            return { success: false, message: "Login failed." };
          }

          const token = response.data.TOKEN;
          localStorage.setItem("authToken", token);
          setAuthorizationHeader(token);
          get().setUser(response.data.user);

          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.error || "Login failed.",
          };
        }
      },

      logout: async () => {
        const tabId = getTabId();
        const user = get().user;

        try {
          await axios.post(
            `${backendUrl}/auth/logout`,
            { userId: user?.id, username: user?.username },
            { withCredentials: true }
          );
        } catch (error) {
          console.error("Logout request failed:", error);
        } finally {
          const storedUsers = getStoredUsers();
          delete storedUsers[tabId];
          localStorage.setItem("storedUsers", JSON.stringify(storedUsers));

          if (Object.keys(storedUsers).length === 0) {
            localStorage.removeItem("authToken");
            setAuthorizationHeader(null);
          }

          set({ user: null });
        }
      },

      initializeAuth: () => {
        setAuthorizationHeader(localStorage.getItem("authToken"));
      },
    }),
    {
      name: "auth-storage",
      storage: createTabSpecificStorage(),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

useAuthStore.getState().initializeAuth();

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useRegister = () => useAuthStore((state) => state.register);
export const useLogin = () => useAuthStore((state) => state.login);
export const useLogout = () => useAuthStore((state) => state.logout);
export const useInitializeAuth = () =>
  useAuthStore((state) => state.initializeAuth);

export default useAuthStore;
