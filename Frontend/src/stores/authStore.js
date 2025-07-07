  import { create } from "zustand";
  import { persist } from "zustand/middleware";
  import axios from "axios";

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const useAuthStore = create(
    persist(
      (set, get) => ({
        user: null,

        setUser: (user) => {
          set({ user });

          const currentTabId = sessionStorage.getItem("tabId");
          const storedUsers = JSON.parse(
            localStorage.getItem("storedUsers") || "{}"
          );

          if (user) {
            storedUsers[currentTabId] = user;
          } else {
            delete storedUsers[currentTabId];
          }

          localStorage.setItem("storedUsers", JSON.stringify(storedUsers));

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
          const currentTabId = sessionStorage.getItem("tabId");
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

            localStorage.removeItem("authToken");
            delete axios.defaults.headers.common["Authorization"];

            set({ user: null });
          } catch (error) {
            console.error("Logout failed:", error);
          }
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ user: state.user }),
      }
    )
  );

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