import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:8000",
  withCredentials: true
});

// Interceptor to attach JWT / session token to all outbound requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("aivora_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with auto-retry for server cold-boots (500/502/503/504)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry logic for cold boot / server waking up (up to 2 retries)
    const status = error.response?.status;
    const isWarmingUp =
      status === 502 ||
      status === 503 ||
      status === 504 ||
      (status === 500 && config?.method === 'get') ||
      (status === 500 && config?.url?.includes('/guest/session'));

    if (isWarmingUp && (!config._retryCount || config._retryCount < 2)) {
      config._retryCount = (config._retryCount || 0) + 1;
      const delay = config._retryCount * 1800; // 1.8s, then 3.6s
      console.warn(
        `[API] Server warming up (${status}). Retrying ${config.url} in ${delay}ms (attempt ${config._retryCount}/2)...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    if (error.response && error.response.status === 401) {
      // Don't clear for login/check endpoints to avoid redirect loops
      if (!error.config.url.includes("/auth/")) {
        // Session invalid
      }
    }
    return Promise.reject(error);
  }
);

export default api;
