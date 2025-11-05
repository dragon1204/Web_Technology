import axios from "axios";
const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
});
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xuất ra các hàm để gọi API cụ thể (lấy từ Swagger)
export const getListUsers = () => {
  return apiClient.get("/users");
};

export const login = (email, password) => {
  return apiClient.post("/auth/login", { email, password });
};
