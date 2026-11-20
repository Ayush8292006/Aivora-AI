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

// Response interceptor to handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
