import { config } from "../config";

const API_BASE = config.API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const gardenService = {
  async createGarden(gardenData, targetUserId = null) {
    const url = targetUserId
      ? `${API_BASE}/garden?userId=${targetUserId}`
      : `${API_BASE}/garden`;

    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(gardenData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create garden");
    }

    return response.json();
  },

  async getGardens(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    console.log("GardenService: Fetching gardens with params:", params);
    console.log("GardenService: API URL:", `${API_BASE}/garden?${queryParams}`);

    const response = await fetch(`${API_BASE}/garden?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    console.log("GardenService: Response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("GardenService: Error response:", error);
      throw new Error(error.message || "Failed to fetch gardens");
    }

    const data = await response.json();
    console.log("GardenService: Success response:", data);
    return data;
  },

  async getGardenById(id) {
    const response = await fetch(`${API_BASE}/garden/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch garden");
    }

    return response.json();
  },

  async updateGarden(id, gardenData) {
    const response = await fetch(`${API_BASE}/garden/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(gardenData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update garden");
    }

    return response.json();
  },

  async deleteGarden(id) {
    const response = await fetch(`${API_BASE}/garden/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete garden");
    }

    return response.json();
  },
};
