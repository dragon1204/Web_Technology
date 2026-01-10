import { config } from "../config";

const API_BASE = config.API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const vegetableService = {
  async createVegetable(vegetableData) {
    const response = await fetch(`${API_BASE}/vegetable`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(vegetableData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create vegetable");
    }

    return response.json();
  },

  async getVegetables(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await fetch(`${API_BASE}/vegetable?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch vegetables");
    }

    return response.json();
  },

  async updatePrice(id, priceData) {
    const response = await fetch(`${API_BASE}/vegetable/price/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(priceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update price");
    }

    return response.json();
  },

  async updateImported(id, importData) {
    const response = await fetch(`${API_BASE}/vegetable/imported/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(importData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update imported quantity");
    }

    return response.json();
  },

  async updateSold(id, soldData) {
    const response = await fetch(`${API_BASE}/vegetable/sold/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(soldData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update sold quantity");
    }

    return response.json();
  },

  async getRevenue(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.vegetableId)
      queryParams.append("vegetableId", params.vegetableId);

    const response = await fetch(
      `${API_BASE}/vegetable/revenue/list?${queryParams}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch revenue data");
    }

    return response.json();
  },

  async getTotalRevenue(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const response = await fetch(
      `${API_BASE}/vegetable/revenue/total?${queryParams}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch total revenue");
    }

    return response.json();
  },

  async deleteVegetable(id) {
    const response = await fetch(`${API_BASE}/vegetable/delete/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete vegetable");
    }

    return response.json();
  },
};
