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
    // Only send required fields according to Swagger API
    const registerPayload = {
      email: userData.email,
      password: userData.password,
      name: userData.name,
    };

    console.log("AuthService: Attempting registration with:", registerPayload);

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerPayload),
    });

    console.log("AuthService: Registration response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AuthService: Registration error response:", errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { message: errorText || "Registration failed" };
      }

      // Extract the actual error message
      let errorMessage = "Registration failed";
      if (error.message) {
        if (typeof error.message === "string") {
          errorMessage = error.message;
        } else if (error.message.message) {
          errorMessage = error.message.message;
        } else if (Array.isArray(error.message)) {
          errorMessage = error.message.join(", ");
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("AuthService: Registration success:", data);
    return data;
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

  // 2FA Methods
  async generate2FA() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/auth/2fa/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate 2FA secret");
    }

    return response.json();
  },

  async enable2FA(totpCode) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/auth/2fa/enable`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ totp_code: totpCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to enable 2FA");
    }

    return response.json();
  },

  async disable2FA() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/auth/2fa/disable`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to disable 2FA");
    }

    return response.json();
  },

  async get2FAQRCode() {
    const token = localStorage.getItem("token");

    console.log("AuthService: Getting 2FA QR code...");

    const response = await fetch(`${API_BASE}/auth/2fa/qrcode`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("AuthService: QR code response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AuthService: QR code error:", errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { message: errorText || "Failed to get QR code" };
      }

      throw new Error(error.message || "Failed to get QR code");
    }

    const data = await response.json();
    console.log("AuthService: QR code data:", data);
    return data;
  },
};
