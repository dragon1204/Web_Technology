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
      console.log("Login raw response:", response); // Debug log

      // 1) Trường hợp 2FA: authService đã flatten thành { requires2FA, message, data }
      if (response && response.requires2FA === true) {
        console.log("Login requires 2FA step - returning requires2FA flag");
        const message =
          response.message || "Two-factor code is required";
        return {
          success: false,
          requires2FA: true,
          error: message,
        };
      }

      // 2) Trường hợp login thành công: chuẩn hóa cấu trúc, lấy "core" là phần payload chính
      // Hỗ trợ các kiểu:
      // - { HttpCode, success, data: { access_token, ... } }
      // - { HttpCode, success, data: { HttpCode, success, data: { ... } } }
      // - Hoặc object đơn giản { access_token, user }
      const core =
        (response &&
          response.data &&
          response.data.data &&
          typeof response.data.data === "object"
          ? response.data.data
          : response && response.data && typeof response.data === "object"
          ? response.data
          : response) || response;

      console.log("Login core payload:", core);

      // Xử lý nhiều format response có thể từ backend
      let access_token, userData;

      // Format chuẩn từ BE mới: core = { access_token, refresh_token, user }
      if (core && core.access_token) {
        console.log("Using format: core.access_token");
        access_token = core.access_token;
        userData = core.user;
      } else if (response && response.access_token && response.user) {
        // Format legacy: { access_token, user }
        console.log("Using format: response.access_token");
        access_token = response.access_token;
        userData = response.user;
      } else if (response && response.token && response.user) {
        console.log("Using format: response.token");
        access_token = response.token;
        userData = response.user;
      } else if (response && response.accessToken) {
        console.log("Using format: response.accessToken");
        access_token = response.accessToken;
        userData = response.user;
      } else {
        // Fallback: cố gắng lấy token từ nhiều chỗ
        console.log("Unknown response format, creating user from response");
        console.log("Full response:", JSON.stringify(response, null, 2));
        access_token =
          core?.access_token ||
          core?.token ||
          core?.accessToken ||
          response?.access_token ||
          response?.token ||
          response?.accessToken;
        userData =
          core?.user ||
          response?.user || {
            id: core?.id || response?.id || response?.userId,
            email: credentials.email,
            name:
              core?.name ||
              response?.name ||
              response?.username ||
              credentials.email.split("@")[0],
            role: core?.role || response?.role || "USER",
          };
      }

      console.log("Parsed access_token:", access_token);
      console.log("Parsed userData:", userData);

      if (!access_token) {
        console.error(
          "No access token found in response (core):",
          JSON.stringify(core, null, 2)
        );
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
      // Bubble up so UI layers can handle and display meaningful feedback
      throw (error instanceof Error ? error : new Error("Login failed"));
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

  // Method to set auth state directly (for OAuth callback)
  const setAuthState = (newToken, newUser) => {
    console.log("Setting auth state:", { token: newToken ? "exists" : "none", user: newUser });
    setToken(newToken);
    setUser(newUser);
    if (newToken) {
      localStorage.setItem("token", newToken);
    }
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
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
    setAuthState,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
