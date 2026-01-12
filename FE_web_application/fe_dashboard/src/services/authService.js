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

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
      let errorData = null;
      let errorMessage = "Login failed";

      try {
        errorData = isJson ? await response.json() : await response.text();
      } catch (e) {
        console.error("AuthService: Failed to parse error response", e);
      }

      if (errorData) {
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (typeof errorData.message === "string") {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        }
      }

      console.error("AuthService: Login error:", errorData || errorMessage); // Debug log

      // Special case: 2FA required flow
      if (
        response.status === 401 &&
        typeof errorMessage === "string" &&
        errorMessage.toLowerCase().includes("two-factor code is required")
      ) {
        return {
          requires2FA: true,
          message: errorMessage,
          status: response.status,
        };
      }

      throw new Error(errorMessage || "Login failed");
    }

    const data = isJson ? await response.json() : await response.text();
    console.log("AuthService: Login success, data:", data); // Debug log

    // Nếu response là string (text) thì parse lại
    let parsedData = data;
    if (typeof data === "string") {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        console.error("AuthService: Failed to parse string response", e);
        return data;
      }
    }

    console.log("AuthService: Parsed data:", parsedData);
    console.log("AuthService: requires2FA check:", parsedData?.requires2FA);
    console.log("AuthService: requires2FA in data:", parsedData?.data?.requires2FA);

    // Nếu backend trả requires2FA (trong body 200) → chuyển cho UI xử lý
    // Check cả response.requires2FA và response.data.requires2FA (nested structure)
    const requires2FA = parsedData?.requires2FA === true || parsedData?.data?.requires2FA === true;

    if (parsedData && requires2FA) {
      console.log("AuthService: 2FA required detected, returning requires2FA flag");
      const twoFAData = parsedData.data?.requires2FA ? parsedData.data : parsedData;
      return {
        requires2FA: true,
        message: twoFAData.message || parsedData.message || "Two-factor code is required",
        data: twoFAData.data || parsedData.data,
      };
    }

    // Store refresh token if provided
    const refreshToken =
      parsedData.refresh_token ||
      (parsedData.data && parsedData.data.refresh_token) ||
      parsedData.refreshToken ||
      (parsedData.data && parsedData.data.refreshToken);

    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }

    return parsedData;
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
  // Helper to parse errors
  async _parseError(response) {
    let errorMessage = "Request failed";
    try {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.message) {
          if (typeof errorData.message === "string") {
            errorMessage = errorData.message;
          } else if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(", ");
          } else {
            errorMessage = JSON.stringify(errorData.message);
          }
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (e) {
        errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
      }
    } catch (e) {
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    return new Error(errorMessage);
  },

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
      throw await this._parseError(response);
    }

    return response.json();
  },

  async enable2FA(totpCode) {
    const token = localStorage.getItem("token");
    console.log("AuthService: Enabling 2FA with code length:", totpCode?.length);

    const response = await fetch(`${API_BASE}/auth/2fa/enable`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: totpCode }),
    });

    if (!response.ok) {
      console.error("AuthService: Enable 2FA failed with status:", response.status);
      throw await this._parseError(response);
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
      throw await this._parseError(response);
    }

    return response.json();
  },

  async get2FAQRCode(otpauthUrl) {
    const token = localStorage.getItem("token");

    if (!otpauthUrl) {
      throw new Error("otpauthUrl is required");
    }

    console.log("AuthService: Getting 2FA QR code...");

    const response = await fetch(`${API_BASE}/auth/2fa/qrcode`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otpauthUrl }),
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

    // Return blob để tạo image URL
    return await response.blob();
  },
};
