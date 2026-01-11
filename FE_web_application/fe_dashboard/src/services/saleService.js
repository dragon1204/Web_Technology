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

export const saleService = {
  // Create a sale transaction
  async createSale(gardenId, saleData) {
    console.log("SaleService: Creating sale for garden:", gardenId, saleData);

    const response = await fetch(`${API_BASE}/garden/${gardenId}/sale`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(saleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create sale");
    }

    return response.json();
  },

  // Get sales list for a garden
  async getSales(gardenId, params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    console.log("SaleService: Fetching sales for garden:", gardenId);

    const response = await fetch(
      `${API_BASE}/garden/${gardenId}/sale?${queryParams}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch sales");
    }

    const data = await response.json();
    console.log("SaleService: Sales data:", data);
    return data;
  },

  // Get revenue statistics for a garden
  async getRevenue(gardenId, params = {}) {
    const queryParams = new URLSearchParams();

    // Type is required: day, week, or month
    queryParams.append("type", params.type || "month");

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    console.log(
      "SaleService: Fetching revenue for garden:",
      gardenId,
      "with params:",
      params
    );

    const response = await fetch(
      `${API_BASE}/garden/${gardenId}/sale/revenue?${queryParams}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SaleService: Revenue error:", errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { message: errorText || "Failed to fetch revenue" };
      }

      throw new Error(error.message || "Failed to fetch revenue");
    }

    const data = await response.json();
    console.log("SaleService: Revenue data:", data);
    return data;
  },
};
