import axios from "axios";

const API_URL = "http://159.223.61.25:3000";

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

export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  getProfile: () => api.get("/auth/profile"),
};

export const userAPI = {
  getAll: (params) => api.get("/users", { params }),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const gardenAPI = {
  getAll: (params) => api.get("/garden", { params }),
  getById: (id) => api.get(`/garden/${id}`),
  create: (data) => api.post("/garden", data),
  update: (id, data) => api.put(`/garden/${id}`, data),
  delete: (id) => api.delete(`/garden/${id}`),
  adminGetAll: (params) => api.get("/garden", { params }),
};

export const vegetableAPI = {
  getAll: (params) => api.get("/vegetable", { params }),
  create: (data) => api.post("/vegetable", data),
  getRevenue: () => api.get("/vegetable/revenue/all"),
  updatePrice: (id, price) => api.patch(`/vegetable/price/${id}`, { price }),
  updateImported: (id, quantity) =>
    api.patch(`/vegetable/imported/${id}`, { quantity }),
  updateSold: (id, quantity) =>
    api.patch(`/vegetable/sold/${id}`, { quantity }),
};

export default api;
