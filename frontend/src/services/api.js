import axios from "axios";

const API = axios.create({ baseURL: "/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for catching 401s and refreshing tokens
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to retry the request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint directly using axios (to avoid infinite interceptor loops)
        const res = await axios.post("/api/auth/refresh", { refreshToken });
        
        const payload = res.data.data || res.data;
        const newAccessToken = payload.accessToken;
        const newRefreshToken = payload.refreshToken;

        // Save new tokens
        if (newAccessToken) localStorage.setItem("token", newAccessToken);
        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

        // Update default header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        // If refresh fails, purge auth cache so user falls back to login screen safely
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        
        // Only redirect if we are in a browser context
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  refresh: (data) => API.post("/auth/refresh", data),
  logout: () => API.post("/auth/logout"),
  verifyEmail: (data) => API.post("/auth/verify-email", data),
  resendVerification: (data) => API.post("/auth/resend-verification", data),
  forgotPassword: (data) => API.post("/auth/forgot-password", data),
  resetPassword: (data) => API.post("/auth/reset-password", data),
};

export const postAPI = {
  getAll: (page = 0, size = 10) => API.get(`/posts?page=${page}&size=${size}`),
  getById: (id) => API.get(`/posts/${id}`),
  create: (data) => API.post("/posts", data),
  update: (id, data) => API.put(`/posts/${id}`, data),
  delete: (id) => API.delete(`/posts/${id}`),
};

export const categoryAPI = {
  getAll: () => API.get("/categories"),
};

// TODO: Add comment API calls
// TODO: Add search API calls

export default API;
