// API URL Configuration
const API_URL = import.meta.env.VITE_API_URL || '/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';
const BASE_URL = import.meta.env.VITE_BASE_URL || '';

// Log configuration
console.log('API Configuration:', {
  API_URL,
  SOCKET_URL,
  BASE_URL,
  EXECUTE_URL: getExecuteUrl(),
});

// Determine execute URL
const getExecuteUrl = () => {
  if (API_URL.includes('/api')) {
    return API_URL.replace('/api', '/execute');
  }
  return BASE_URL ? `${BASE_URL}/execute` : '/execute';
};

// Create paths
export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/users/login`,
    REGISTER: `${API_URL}/users/register`,
    PROFILE: `${API_URL}/users/profile`,
    UPDATE: `${API_URL}/users/update`,
    TEST: `${API_URL}/users/test`,
  },
  CODE: {
    EXECUTE: getExecuteUrl(),
    SUBMISSIONS: `${API_URL}/code/submissions`,
    COLLABORATIONS: `${API_URL}/code/collaborations`,
  },
  SHARE: {
    CREATE: `${API_URL}/share`,
    GET: (id) => `${API_URL}/share/${id}`,
  },
  FILES: {
    LIST: `${API_URL}/files`,
    GET: (id) => `${API_URL}/files/${id}`,
    CREATE: `${API_URL}/files`,
    UPDATE: (id) => `${API_URL}/files/${id}`,
    DELETE: (id) => `${API_URL}/files/${id}`,
  },
  SOCKET: SOCKET_URL,
};

export default ENDPOINTS;