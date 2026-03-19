import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
 
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api/";
const API_VERSION = process.env.API_VERSION || "v1";

// Axios instance
export const api = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  withCredentials: true, // required for refresh cookies
});

// Storage helpers
const getAccessToken = () => localStorage.getItem("access_token");
const setAccessToken = (token: string) => localStorage.setItem("access_token", token);
const clearAuthStorage = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("auth_user");
};

// Routes that MUST NEVER trigger refresh logic
const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/verify",
  "/auth/forgot",
  "/auth/reset",
];

// Request Interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (
    token &&
    config.headers &&
    !AUTH_ROUTES.some((route) => config.url?.includes(route))
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Refresh logic
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};


// Response Interceptor
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    if (!originalRequest) {
      return Promise.reject(error);
    } 
   
    // Ignore auth routes
    if (AUTH_ROUTES.some((route) => requestUrl.includes(route))) {
      return Promise.reject(error);
    }

    // FIX: Handle 429 (Too Many Requests) - Rate limit exceeded
    if (status === 429) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // Max 3 retries for rate limit
      if (originalRequest._retryCount > 3) {
        console.error("[Rate Limit] Max retries exceeded");
        return Promise.reject(error);
      }
      
      const retryAfter = parseInt(error.response?.headers['retry-after'] || '1', 10);
      const waitTime = Math.min(retryAfter * 1000, 5000); // Cap at 5 seconds

      console.warn(`[Rate Limit] Hit limit. Retrying after ${waitTime}ms (Attempt ${originalRequest._retryCount})`);
      
      // Retry the request after wait
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, waitTime);
      });
    }

    // Ignore non-401 errors
    if (status !== 401) {
      return Promise.reject(error);
    }

    // Ignore already retried requests
    if (originalRequest._retry) {
      clearAuthStorage();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    originalRequest._retry = true;
 
    // If refresh already running → queue request
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await api.post("/auth/refresh");

      const newAccessToken = (response.data as any)?.accessToken;

      if (!newAccessToken) {
        throw new Error("No access token returned from refresh");
      }

      setAccessToken(newAccessToken);
      onRefreshed(newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      clearAuthStorage();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
