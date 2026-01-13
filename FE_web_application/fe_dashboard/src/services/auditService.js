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

export const auditService = {
  // Get recent audit logs (Admin only) 🔒
  async getRecentLogs(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.action) queryParams.append("action", params.action);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    console.log("AuditService: Fetching recent logs with params:", params);

    const response = await fetch(`${API_BASE}/audit/recent?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch recent audit logs");
    }

    return response.json();
  },

  // Get audit logs for current user 🔒
  async getMyLogs(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.action) queryParams.append("action", params.action);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    console.log("AuditService: Fetching my logs with params:", params);
    console.log("AuditService: Query string:", queryParams.toString());

    const response = await fetch(`${API_BASE}/audit/my-logs?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    console.log("AuditService: Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AuditService: Error response:", errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { message: errorText || "Failed to fetch user audit logs" };
      }

      throw new Error(error.message || "Failed to fetch user audit logs");
    }

    const data = await response.json();
    console.log("AuditService: My logs response data:", data);
    return data;
  },

  // Get audit logs by entity (Admin only) 🔒
  async getLogsByEntity(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.entityType) queryParams.append("entityType", params.entityType);
    if (params.entityId) queryParams.append("entityId", params.entityId);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    console.log("AuditService: Fetching logs by entity with params:", params);

    const response = await fetch(`${API_BASE}/audit/by-entity?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch audit logs by entity");
    }

    return response.json();
  },

  // Get audit logs by request ID (Admin only) 🔒
  async getLogsByRequest(requestId, params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    console.log(
      "AuditService: Fetching logs by request ID:",
      requestId,
      params
    );

    const response = await fetch(
      `${API_BASE}/audit/by-request?requestId=${requestId}&${queryParams}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch audit logs by request");
    }

    return response.json();
  },

  // Search audit logs with filters and pagination 🔒
  async searchLogs(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.action) queryParams.append("action", params.action);
    if (params.entityType) queryParams.append("entityType", params.entityType);
    if (params.success !== undefined) queryParams.append("success", params.success);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    console.log("AuditService: Searching logs with params:", params);

    const response = await fetch(`${API_BASE}/audit/search?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to search audit logs");
    }

    return response.json();
  },

  // Get audit statistics 🔒
  async getStatistics(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append("startDate", params.startDate.toISOString());
    if (params.endDate) queryParams.append("endDate", params.endDate.toISOString());

    console.log("AuditService: Fetching statistics with params:", params);

    const response = await fetch(`${API_BASE}/audit/statistics?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch audit statistics");
    }

    return response.json();
  },
};
