import { config } from "../config";

const API_BASE = config.API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const userService = {
  // Get all users (Admin only) 🔒
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.search) queryParams.append("search", params.search);
    if (params.role) queryParams.append("role", params.role);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    console.log("UserService: Fetching users with params:", params);

    const response = await fetch(`${API_BASE}/users?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch users");
    }

    return response.json();
  },

  // Create new user (Admin only) 🔒
  async createUser(userData) {
    console.log("UserService: Creating user with data:", userData);

    const response = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create user");
    }

    return response.json();
  },

  // Get current user profile 🔒
  async getMe() {
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get profile");
    }

    return response.json();
  },

  // Get user by ID 🔒
  async getUserById(userId) {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch user");
    }

    return response.json();
  },

  // Update user (Admin only) 🔒
  async updateUser(userId, userData) {
    console.log("UserService: Updating user:", userId, userData);

    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update user");
    }

    return response.json();
  },

  // Delete user (Admin only) 🔒
  async deleteUser(userId) {
    console.log("UserService: Deleting user:", userId);

    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
    }

    return response.json();
  },
};
