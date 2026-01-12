import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      console.log("InitAuth - savedToken:", savedToken ? "exists" : "none");
      console.log("InitAuth - savedUser:", savedUser ? "exists" : "none");

      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log("InitAuth - parsedUser:", parsedUser);

          setToken(savedToken);
          setUser(parsedUser);

          // Verify token is still valid by calling /users/me
          try {
            const profile = await authService.getProfile();
            console.log("InitAuth - profile from API:", profile);

            // Handle the correct backend format: { HttpCode, success, data: {...} }
            let userData = null;
            if (profile && profile.data) {
              userData = profile.data;
            } else if (profile && profile.id) {
              userData = profile;
            }

            if (userData) {
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
            }
          } catch (error) {
            console.error("Token validation failed:", error);
            // Token invalid, clear auth
            logout();
          }
        } catch (error) {
          console.error("Error parsing saved user:", error);
          logout();
        }
      } else {
        console.log("InitAuth - No saved credentials found");
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      console.log("Login response:", response); // Debug log

      // Xử lý nhiều format response có thể từ backend
      let access_token, userData;

      if (response.access_token && response.user) {
        // Format 1: { access_token, user }
        access_token = response.access_token;
        userData = response.user;
      } else if (response.data && response.data.access_token) {
        // Format 2: { data: { access_token, user } }
        access_token = response.data.access_token;
        userData = response.data.user;
      } else if (response.token && response.user) {
        // Format 3: { token, user }
        access_token = response.token;
        userData = response.user;
      } else if (response.accessToken) {
        // Format 4: { accessToken, user }
        access_token = response.accessToken;
        userData = response.user;
      } else {
        // Fallback: Tạo user object từ response
        console.log("Unknown response format, creating user from response");
        access_token =
          response.access_token || response.token || response.accessToken;
        userData = response.user || {
          id: response.id || response.userId,
          email: credentials.email,
          name:
            response.name ||
            response.username ||
            credentials.email.split("@")[0],
          role: response.role || "USER",
        };
      }

      console.log("Parsed access_token:", access_token);
      console.log("Parsed userData:", userData);

      if (!access_token) {
        console.error("No access token found in response:", response);
        throw new Error("No access token received from server");
      }

      // Tạo user object nếu không có
      if (!userData) {
        userData = {
          id: response.id || Date.now(),
          email: credentials.email,
          name: response.name || credentials.email.split("@")[0],
          role: response.role || "USER",
        };
      }

      setToken(access_token);
      setUser(userData);

      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("User set:", userData); // Debug log
      console.log("Token set:", access_token); // Debug log

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refresh_token");
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        logout();
        return false;
      }

      const response = await authService.refreshToken(refreshToken);
      const { access_token } = response;

      setToken(access_token);
      localStorage.setItem("token", access_token);

      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
