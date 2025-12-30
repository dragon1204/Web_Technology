import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://159.223.61.25:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Xử lý lỗi chung và transform response
api.interceptors.response.use(
  (response) => {
    // Backend có TransformResponseInterceptor nên data nằm trong response.data.data
    // Nếu muốn tự động unwrap, có thể làm:
    // return { ...response, data: response.data?.data || response.data };
    // Nhưng để giữ nguyên để dễ debug, giữ nguyên structure
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized) - Token hết hạn
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refresh_token");
      // Redirect về login nếu không phải đang ở trang login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  refresh: (refresh_token) => api.post("/auth/refresh", { refresh_token }),
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // ignore server logout failure; still clear local state
      console.warn("logout request failed", err?.response?.data || err?.message);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refresh_token");
  },
};

// User APIs
export const userAPI = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  getMe: () => api.get("/users/me"),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Garden APIs
export const gardenAPI = {
  getAll: (params = {}) => {
    // Clean params: remove empty strings, null, undefined, and ensure page >= 1
    const cleanParams = {};
    
    // Handle page parameter - default to 1 if not provided or invalid
    if (params.page !== undefined && params.page !== null && params.page !== '') {
      const pageNum = Number(params.page);
      if (!isNaN(pageNum) && pageNum >= 1) {
        cleanParams.page = pageNum;
      } else {
        cleanParams.page = 1; // Default to 1 if invalid
      }
    } else {
      cleanParams.page = 1; // Default to 1 if not provided
    }
    
    if (params.limit !== undefined && params.limit !== null && params.limit !== '') {
      const limitNum = Number(params.limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        cleanParams.limit = limitNum;
      }
    }
    if (params.search !== undefined && params.search !== null && params.search !== '') {
      cleanParams.search = params.search;
    }
    if (params.sortBy !== undefined && params.sortBy !== null && params.sortBy !== '') {
      cleanParams.sortBy = params.sortBy;
    }
    if (params.sortOrder !== undefined && params.sortOrder !== null && params.sortOrder !== '') {
      cleanParams.sortOrder = params.sortOrder;
    }
    if (params.userId !== undefined && params.userId !== null && params.userId !== '') {
      cleanParams.userId = params.userId;
    }
    return api.get("/garden", { params: cleanParams });
  },
  getById: (id) => api.get(`/garden/${id}`),
  create: (data) => api.post("/garden", data),
  update: (id, data) => api.put(`/garden/${id}`, data),
  delete: (id) => api.delete(`/garden/${id}`),

  // Admin endpoints
  adminGetAll: () => api.get("/garden/admin"),
  adminGetById: (id) => api.get(`/garden/admin/${id}`),
  adminCreate: (data) => api.post("/garden/admin", data),
  adminUpdate: (id, data) => api.put(`/garden/admin/${id}`, data),
  adminDelete: (id) => api.delete(`/garden/admin/${id}`),
};

// Vegetable APIs
export const vegetableAPI = {
  getAll: (params = {}) => {
    // Clean params: remove empty strings, null, undefined, and ensure page >= 1
    const cleanParams = {};
    
    // Handle page parameter - default to 1 if not provided or invalid
    if (params.page !== undefined && params.page !== null && params.page !== '') {
      const pageNum = Number(params.page);
      if (!isNaN(pageNum) && pageNum >= 1) {
        cleanParams.page = pageNum;
      } else {
        cleanParams.page = 1; // Default to 1 if invalid
      }
    } else {
      cleanParams.page = 1; // Default to 1 if not provided
    }
    
    if (params.limit !== undefined && params.limit !== null && params.limit !== '') {
      const limitNum = Number(params.limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        cleanParams.limit = limitNum;
      }
    }
    if (params.search !== undefined && params.search !== null && params.search !== '') {
      cleanParams.search = params.search;
    }
    if (params.sortBy !== undefined && params.sortBy !== null && params.sortBy !== '') {
      cleanParams.sortBy = params.sortBy;
    }
    if (params.sortOrder !== undefined && params.sortOrder !== null && params.sortOrder !== '') {
      cleanParams.sortOrder = params.sortOrder;
    }
    return api.get("/vegetable", { params: cleanParams });
  },
  create: (data) => api.post("/vegetable", data),
  updatePrice: (id, price) => api.patch(`/vegetable/price/${id}`, { price }),
  updateImported: (id, imported) => api.patch(`/vegetable/imported/${id}`, { imported }),
  updateSold: (id, sold) => api.patch(`/vegetable/sold/${id}`, { sold }),
  delete: (id) => api.patch(`/vegetable/delete/${id}`),
  getRevenueList: (params = {}) => api.get("/vegetable/revenue/list", { params }),
  getRevenueTotal: (params = {}) => api.get("/vegetable/revenue/total", { params }),
  getPriceHistory: (id, params = {}) => api.get(`/vegetable/price-history/${id}`, { params }),
};

// Notifications APIs
export const notificationAPI = {
  list: (params = {}) => api.get("/notifications", { params }),
  unreadCount: () => api.get("/notifications/unread/count"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Alerts APIs
export const alertsAPI = {
  list: (params = {}) => api.get("/alerts", { params }),
  activeCount: (params = {}) => api.get("/alerts/active/count", { params }),
  resolve: (id) => api.patch(`/alerts/${id}/resolve`),
  createRule: (data) => api.post("/alerts/rules", data),
  listRules: (params = {}) => api.get("/alerts/rules", { params }),
  getRule: (id) => api.get(`/alerts/rules/${id}`),
  updateRule: (id, data) => api.patch(`/alerts/rules/${id}`, data),
  deleteRule: (id) => api.delete(`/alerts/rules/${id}`),
};

// Sensors APIs
export const sensorAPI = {
  getData: (sensorId, params = {}) => api.get(`/sensor-data/sensor/${sensorId}`, { params }),
  getStats: (sensorId, params = {}) => api.get(`/sensor-data/sensor/${sensorId}/statistics`, { params }),
};

// Sales APIs
export const saleAPI = {
  create: (gardenId, data) => api.post(`/garden/${gardenId}/sale`, data),
  getByGarden: (gardenId) => api.get(`/garden/${gardenId}/sale`),
  getRevenue: (gardenId) => api.get(`/garden/${gardenId}/sale/revenue`),
};

// Analytics APIs
export const analyticsAPI = {
  // Revenue Reports
  getRevenueByPeriod: (params = {}) => api.get("/analytics/revenue/period", { params }),
  compareRevenueBetweenGardens: (params = {}) => api.get("/analytics/revenue/compare-gardens", { params }),
  getTopProducts: (params = {}) => api.get("/analytics/revenue/top-products", { params }),
  
  // Productivity Reports
  getProductivityByCategory: (params = {}) => api.get("/analytics/productivity/by-category", { params }),
  getSalesInventoryRatio: (params = {}) => api.get("/analytics/productivity/sales-inventory-ratio", { params }),
  getProductionTrend: (params = {}) => api.get("/analytics/productivity/trend", { params }),
  
  // Sensor Reports
  getSensorAnalysis: (params = {}) => api.get("/analytics/sensor/analysis", { params }),
  getOptimalConditions: (params = {}) => api.get("/analytics/sensor/optimal-conditions", { params }),
  
  // Custom Reports
  generateCustomReport: (data) => api.post("/analytics/custom", data),
  
  // Report Templates
  createTemplate: (data) => api.post("/analytics/templates", data),
  getTemplates: () => api.get("/analytics/templates"),
  getTemplate: (id) => api.get(`/analytics/templates/${id}`),
  updateTemplate: (id, data) => api.patch(`/analytics/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/analytics/templates/${id}`),
};

// Audit APIs
export const auditAPI = {
  getRecent: (params = {}) => api.get("/audit/recent", { params }),
  getMyLogs: (params = {}) => api.get("/audit/my-logs", { params }),
  getByEntity: (params = {}) => api.get("/audit/by-entity", { params }),
  getByRequest: (params = {}) => api.get("/audit/by-request", { params }),
};

export default api;
