// Application configuration - kết nối với backend NestJS
const API_FALLBACK = "http://159.223.61.25:3000";
const API_BASE = process.env.REACT_APP_API_BASE_URL || API_FALLBACK;
const API_URL = process.env.REACT_APP_API_URL || API_BASE;
const GOOGLE_AUTH =
  process.env.REACT_APP_GOOGLE_AUTH_URL || `${API_BASE}/auth/google`;
const SIMULATOR_WS =
  process.env.REACT_APP_SIMULATOR_WS_URL || "ws://localhost:8080";

// Debug: Log API configuration
console.log("🔧 API Configuration:", {
  REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_FALLBACK,
  API_BASE,
  API_URL,
});

export const config = {
  // API Configuration
  API_URL,
  API_BASE_URL: API_BASE,

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
  GOOGLE_AUTH_URL: GOOGLE_AUTH,

  // Device simulator WebSocket (dev only)
  SIMULATOR_WS_URL: SIMULATOR_WS,
};

export default config;
