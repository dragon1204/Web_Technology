import axios from "axios";

<<<<<<< HEAD
const API_URL = "http://localhost:3000/api";
=======
const API_URL = "http://localhost:3000";
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

// User APIs
export const userAPI = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  getByEmail: (email) => api.get(`/users/${email}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Garden APIs
export const gardenAPI = {
  getAll: () => api.get("/garden"),
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
  getAll: () => api.get("/vegetable"),
  create: (data) => api.post("/vegetable", data),
  updatePrice: (id, price) => api.patch(`/vegetable/price/${id}`, { price }),
  updateImported: (id, quantity) =>
    api.patch(`/vegetable/imported/${id}`, { quantity }),
  updateSold: (id, quantity) =>
    api.patch(`/vegetable/sold/${id}`, { quantity }),
  getRevenue: () => api.get("/vegetable/revenue/all"),
};

export default api;
