// Application configuration - kết nối với backend NestJS
export const config = {
  // API Configuration - kết nối với backend localhost
  API_URL: "http://localhost:3000",
  API_BASE_URL: "http://localhost:3000",

  // Chart configuration
  CHART_COLORS: {
    primary: "#4cbe00",
    secondary: "#28392e",
    accent: "#6366f1",
    warning: "#f59e0b",
    error: "#dc2626",
    success: "#10b981",
  },

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,

  // File upload limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

  // Supported file types
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],

  // Date formats
  DATE_FORMAT: "DD/MM/YYYY",
  DATETIME_FORMAT: "DD/MM/YYYY HH:mm",

  // Local storage keys
  STORAGE_KEYS: {
    TOKEN: "token",
    REFRESH_TOKEN: "refresh_token",
    USER: "user",
    THEME: "theme",
    LANGUAGE: "language",
  },

  // OAuth
  GOOGLE_AUTH_URL: "http://localhost:3000/auth/google",
};

export default config;
