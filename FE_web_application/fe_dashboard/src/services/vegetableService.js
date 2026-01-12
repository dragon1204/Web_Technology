import { config } from "../config";

const API_BASE = config.API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log(
    "VegetableService: Token from localStorage:",
    token ? "exists" : "none"
  );
  console.log("VegetableService: Token value:", token);

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log("VegetableService: Headers:", headers);
  return headers;
};

export const vegetableService = {
  async createVegetable(vegetableData) {
    console.log(
      "VegetableService: Creating vegetable with data:",
      vegetableData
    );

    const response = await fetch(`${API_BASE}/vegetable`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(vegetableData),
    });

    console.log("VegetableService: Create response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("VegetableService: Create error response:", errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { message: errorText || "Failed to create vegetable" };
      }

      console.error("VegetableService: Parsed error:", error);

      // Extract the actual error message
      let errorMessage = "Failed to create vegetable";
      if (error.message) {
        if (typeof error.message === "string") {
          errorMessage = error.message;
        } else if (error.message.message) {
          errorMessage = error.message.message;
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("VegetableService: Create success:", data);
    return data;
  },

  async getVegetables(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    console.log("VegetableService: Fetching vegetables with params:", params);
    console.log(
      "VegetableService: API URL:",
      `${API_BASE}/vegetable?${queryParams}`
    );

    try {
      const response = await fetch(`${API_BASE}/vegetable?${queryParams}`, {
        headers: getAuthHeaders(),
      });

      console.log("VegetableService: Response status:", response.status);

      // Handle both success (200) and some backends that return 400 with valid data
      if (!response.ok && response.status !== 400) {
        const errorText = await response.text();
        console.error("VegetableService: Error response text:", errorText);

        let error;
        try {
          error = JSON.parse(errorText);
        } catch (e) {
          error = { message: errorText || "Failed to fetch vegetables" };
        }

        console.error("VegetableService: Error response:", error);

        // If unauthorized, return empty data instead of throwing
        if (response.status === 401) {
          console.log("VegetableService: Unauthorized, returning empty data");
          return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
        }

        throw new Error(error.message || "Failed to fetch vegetables");
      }

      const data = await response.json();
      console.log("VegetableService: Success response:", data);
      return data;
    } catch (error) {
      console.error("VegetableService: Network or parsing error:", error);
      // Return empty data instead of throwing to prevent app crash
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
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

    // Add pagination parameters (required by backend)
    queryParams.append("page", params.page || 1);
    queryParams.append("limit", params.limit || 100);

    // Add required type parameter: day, week, or month
    queryParams.append("type", params.type || "month");

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.vegetableId)
      queryParams.append("vegetableId", params.vegetableId);

    console.log(
      "VegetableService: Fetching revenue with URL:",
      `${API_BASE}/vegetable/revenue/list?${queryParams}`
    );

    const response = await fetch(
      `${API_BASE}/vegetable/revenue/list?${queryParams}`,
      {
        headers: getAuthHeaders(),
      }
    );

    console.log("VegetableService: Revenue response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("VegetableService: Revenue error:", errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { message: errorText || "Failed to fetch revenue data" };
      }

      throw new Error(error.message || "Failed to fetch revenue data");
    }

    const data = await response.json();
    console.log("VegetableService: Revenue data:", data);
    return data;
  },

  async getTotalRevenue(params = {}) {
    const queryParams = new URLSearchParams();

    // Add required type parameter: day, week, or month
    queryParams.append("type", params.type || "month");

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    console.log(
      "VegetableService: Fetching total revenue with URL:",
      `${API_BASE}/vegetable/revenue/total?${queryParams}`
    );

    const response = await fetch(
      `${API_BASE}/vegetable/revenue/total?${queryParams}`,
      {
        headers: getAuthHeaders(),
      }
    );

    console.log(
      "VegetableService: Total revenue response status:",
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("VegetableService: Total revenue error:", errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { message: errorText || "Failed to fetch total revenue" };
      }

      throw new Error(error.message || "Failed to fetch total revenue");
    }

    const data = await response.json();
    console.log("VegetableService: Total revenue data:", data);
    return data;
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
