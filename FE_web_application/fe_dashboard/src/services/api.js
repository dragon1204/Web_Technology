import axios from "axios";

const API_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Authentication APIs
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  googleRedirect: () => api.get("/auth/google/redirect"),
};

// User Management APIs
export const userAPI = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (id, passwordData) =>
    api.patch(`/users/${id}/password`, passwordData),
};

// Garden Management APIs
export const gardenAPI = {
  getAll: (params) => api.get("/garden", { params }),
  getById: (id) => api.get(`/garden/${id}`),
  create: (data) => api.post("/garden", data),
  update: (id, data) => api.put(`/garden/${id}`, data),
  delete: (id) => api.delete(`/garden/${id}`),
  // Garden Sale APIs
  createSale: (gardenId, saleData) =>
    api.post(`/garden/${gardenId}/sale`, saleData),
  getSales: (gardenId) => api.get(`/garden/${gardenId}/sale`),
  getSaleRevenue: (gardenId) => api.get(`/garden/${gardenId}/sale/revenue`),
};

// Vegetable Management APIs
export const vegetableAPI = {
  getAll: (params) => api.get("/vegetable", { params }),
  getById: (id) => api.get(`/vegetable/${id}`),
  create: (data) => api.post("/vegetable", data),
  update: (id, data) => api.patch(`/vegetable/${id}`, data),
  delete: (id) => api.delete(`/vegetable/${id}`),
  getPriceHistory: (id) => api.get(`/vegetable/price-history/${id}`),
};

// Analytics & Reports APIs
export const analyticsAPI = {
  // Revenue Analytics
  getRevenuePeriod: (params) =>
    api.get("/analytics/revenue/period", { params }),
  compareGardens: (params) =>
    api.get("/analytics/revenue/compare-gardens", { params }),
  getTopProducts: (params) =>
    api.get("/analytics/revenue/top-products", { params }),

  // Productivity Analytics
  getProductivityByCategory: (params) =>
    api.get("/analytics/productivity/by-category", { params }),
  getSalesInventoryRatio: (params) =>
    api.get("/analytics/productivity/sales-inventory-ratio", { params }),
  getProductivityTrend: (params) =>
    api.get("/analytics/productivity/trend", { params }),

  // Sensor Analytics
  getSensorAnalysis: (params) =>
    api.get("/analytics/sensor/analysis", { params }),
  getOptimalConditions: (params) =>
    api.get("/analytics/sensor/optimal-conditions", { params }),

  // Custom Analytics
  createCustomReport: (data) => api.post("/analytics/custom", data),

  // Templates
  createTemplate: (data) => api.post("/analytics/templates", data),
  getTemplates: (params) => api.get("/analytics/templates", { params }),
  getTemplateById: (id) => api.get(`/analytics/templates/${id}`),
  updateTemplate: (id, data) => api.patch(`/analytics/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/analytics/templates/${id}`),
};

// Notifications APIs
export const notificationAPI = {
  create: (data) => api.post("/notifications", data),
  getAll: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread/count"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Alerts APIs
export const alertAPI = {
  getAll: (params) => api.get("/alerts", { params }),
  getActiveCount: () => api.get("/alerts/active/count"),
  resolve: (id) => api.patch(`/alerts/${id}/resolve`),

  // Alert Rules
  createRule: (data) => api.post("/alerts/rules", data),
  getRules: (params) => api.get("/alerts/rules", { params }),
  getRuleById: (id) => api.get(`/alerts/rules/${id}`),
  updateRule: (id, data) => api.patch(`/alerts/rules/${id}`, data),
  deleteRule: (id) => api.delete(`/alerts/rules/${id}`),
};

// Audit Logs APIs
export const auditAPI = {
  getRecent: (params) => api.get("/audit/recent", { params }),
  getMyLogs: (params) => api.get("/audit/my-logs", { params }),
  getByEntity: (params) => api.get("/audit/by-entity", { params }),
  getByRequest: (params) => api.get("/audit/by-request", { params }),
};

export default api;
