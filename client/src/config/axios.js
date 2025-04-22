import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api", // ✅ Fix: Use import.meta.env
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
