import { config } from "../config";

const API_BASE = config.API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log(
    "GardenService: Token from localStorage:",
    token ? "exists" : "none"
  );
  console.log("GardenService: Token value:", token);

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log("GardenService: Headers:", headers);
  return headers;
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

    try {
      const response = await fetch(`${API_BASE}/garden?${queryParams}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      console.log("GardenService: Response status:", response.status);
      console.log("GardenService: Response headers:", response.headers);

      // Always try to parse JSON response, regardless of status
      const data = await response.json();
      console.log("GardenService: Raw response data:", data);

      // Check if response has the expected format
      if (data && (data.data || Array.isArray(data))) {
        console.log("GardenService: Success - returning data");
        return data;
      } else {
        console.error("GardenService: Unexpected response format:", data);
        // Return empty data structure
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      }
    } catch (error) {
      console.error("GardenService: Network or parsing error:", error);
      // Return empty data instead of throwing to prevent app crash
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
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
