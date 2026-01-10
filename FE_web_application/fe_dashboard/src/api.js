// API Helper với auto token refresh
import { config } from "./config";

const API_BASE = config.API_BASE_URL;

export const api = {
  get: async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${localStorage.getItem(config.STORAGE_KEYS.TOKEN)}`,
        ...options.headers,
      },
    });

    // Handle token expiration
    if (response.status === 401) {
      const refreshed = await api.refreshToken();
      if (refreshed) {
        // Retry with new token
        return fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers: {
            Authorization: `Bearer ${localStorage.getItem(config.STORAGE_KEYS.TOKEN)}`,
            ...options.headers,
          },
        });
      }
    }

    return response;
  },

  post: async (endpoint, data, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem(config.STORAGE_KEYS.TOKEN)}`,
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });

    // Handle token expiration
    if (response.status === 401) {
      const refreshed = await api.refreshToken();
      if (refreshed) {
        // Retry with new token
        return fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(config.STORAGE_KEYS.TOKEN)}`,
            ...options.headers,
          },
          body: JSON.stringify(data),
          ...options,
        });
      }
    }

    return response;
  },

  put: async (endpoint, data, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem(config.STORAGE_KEYS.TOKEN)}`,
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });

    if (response.status === 401) {
      const refreshed = await api.refreshToken();
      if (refreshed) {
        return fetch(`${API_BASE}${endpoint}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(config.STORAGE_KEYS.TOKEN)}`,
            ...options.headers,
          },
          body: JSON.stringify(data),
          ...options,
        });
      }
    }

    return response;
  },

  delete: async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem(config.STORAGE_KEYS.TOKEN)}`,
        ...options.headers,
      },
      ...options,
    });

    if (response.status === 401) {
      const refreshed = await api.refreshToken();
      if (refreshed) {
        return fetch(`${API_BASE}${endpoint}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(config.STORAGE_KEYS.TOKEN)}`,
            ...options.headers,
          },
          ...options,
        });
      }
    }

    return response;
  },

  patch: async (endpoint, data, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem(config.STORAGE_KEYS.TOKEN)}`,
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });

    if (response.status === 401) {
      const refreshed = await api.refreshToken();
      if (refreshed) {
        return fetch(`${API_BASE}${endpoint}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(config.STORAGE_KEYS.TOKEN)}`,
            ...options.headers,
          },
          body: JSON.stringify(data),
          ...options,
        });
      }
    }

    return response;
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem(config.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(config.STORAGE_KEYS.TOKEN, data.access_token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  },
};
};

export default api;
