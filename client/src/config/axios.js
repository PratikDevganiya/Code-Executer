import axios from "axios";

// Make sure we use environment variables first, with fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || "/api";

console.log("Using API URL:", API_URL);

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor to attach token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor for handling 401 (Unauthorized)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    
    // Handle network errors (CORS, server down, etc.)
    if (!error.response) {
      console.error('Network Error: Please check your connection or server availability');
    }
    
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // You can add a redirect to login here if needed
      // window.location.href = '/login';
    }
    
    // Handle CORS errors
    if (error.message?.includes('Network Error') || error.message?.includes('CORS')) {
      console.error('This may be a CORS issue. Check server configuration.');
    }
    
    return Promise.reject(error);
  }
);

export default instance;
