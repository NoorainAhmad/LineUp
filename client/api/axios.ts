import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "/api/v1",
});

// Automatically attach JWT to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
