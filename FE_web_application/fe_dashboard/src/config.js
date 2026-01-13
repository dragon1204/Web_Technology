// Application configuration - kết nối với backend NestJS
// Ưu tiên env variables, nếu không có thì auto-detect protocol
const isHttps = window.location.protocol === 'https:';
const protocol = isHttps ? 'https' : 'http';
const API_FALLBACK = `${protocol}://159.223.61.25:3000`;

// Helper function để validate và normalize URL
const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  // Remove trailing slash
  url = url.trim().replace(/\/+$/, '');
  // Ensure it starts with http:// or https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return null;
  }
  return url;
};

// Ưu tiên env variables (nếu có thì dùng, không auto-detect)
// Nếu env variable có HTTP thì dùng HTTP (ngay cả khi frontend chạy HTTPS)
let API_BASE = process.env.REACT_APP_API_BASE_URL || API_FALLBACK;
let API_URL = process.env.REACT_APP_API_URL || API_BASE;

// Force HTTP nếu env variable chỉ định HTTP (để tránh SSL error khi backend chưa có HTTPS)
if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.startsWith('http://')) {
  API_URL = process.env.REACT_APP_API_URL;
}
if (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.startsWith('http://')) {
  API_BASE = process.env.REACT_APP_API_BASE_URL;
}

// Validate và normalize URLs
API_BASE = normalizeUrl(API_BASE) || API_FALLBACK;
API_URL = normalizeUrl(API_URL) || API_BASE;

// Build Google Auth URL
let GOOGLE_AUTH = process.env.REACT_APP_GOOGLE_AUTH_URL;
if (!GOOGLE_AUTH || !normalizeUrl(GOOGLE_AUTH)) {
  GOOGLE_AUTH = `${API_BASE}/auth/google`;
}

// Build WebSocket URL
let SIMULATOR_WS = process.env.REACT_APP_SIMULATOR_WS_URL;
if (!SIMULATOR_WS || (!SIMULATOR_WS.startsWith('ws://') && !SIMULATOR_WS.startsWith('wss://'))) {
  SIMULATOR_WS = isHttps ? "wss://159.223.61.25:8080" : "ws://159.223.61.25:8080";
}

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
