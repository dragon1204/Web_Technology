import { config } from "../config";

const API_BASE = config.API_BASE_URL;

export const authService = {
  async login(credentials) {
    console.log("AuthService: Attempting login to:", `${API_BASE}/auth/login`); // Debug log

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    console.log("AuthService: Response status:", response.status); // Debug log

    if (!response.ok) {
      const error = await response.json();
      console.error("AuthService: Login error:", error); // Debug log
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    console.log("AuthService: Login success, data:", data); // Debug log

    // Store refresh token if provided
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    return data;
  },

  async register(userData) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },

  async refreshToken(refreshToken) {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Token refresh failed");
    }

    return response.json();
  },

  async getProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get profile");
    }

    return response.json();
  },

  async logout() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout request failed:", error);
      }
    }
  },

  // Google OAuth
  getGoogleAuthUrl() {
    return `${API_BASE}/auth/google`;
  },

  // Handle OAuth callback
  async handleOAuthCallback(token, userData) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    return { token, user: userData };
  },
};
