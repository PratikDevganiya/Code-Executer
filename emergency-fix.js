#!/usr/bin/env node

/**
 * Emergency fix script that injects environment variables directly 
 * into the built JavaScript files in client/dist
 */

const fs = require('fs');
const path = require('path');

console.log('Starting emergency environment variable fix...');

// Environment variables to inject
const ENV_VARS = {
  VITE_API_URL: '/api',
  VITE_SOCKET_URL: '/',
  VITE_BASE_URL: ''
};

// Create a temp .env file with fixed values
const envPath = path.join(__dirname, 'client', '.env');
const envContent = Object.entries(ENV_VARS)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

console.log('Writing fixed .env file:');
console.log(envContent);
fs.writeFileSync(envPath, envContent, 'utf8');

// Create a stronger vite.config.js that forces the environment variables
const viteConfigPath = path.join(__dirname, 'client', 'vite.config.js');
const viteConfig = `
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Force these values in production
  const forcedEnv = {
    VITE_API_URL: '/api',
    VITE_SOCKET_URL: '/',
    VITE_BASE_URL: ''
  };
  
  console.log('Building with FORCED environment:', forcedEnv);
  
  return {
    plugins: [
      tailwindcss(),
      react()
    ],
    define: {
      // Hard-code environment variables
      'import.meta.env.VITE_API_URL': JSON.stringify('/api'),
      'import.meta.env.VITE_SOCKET_URL': JSON.stringify('/'),
      'import.meta.env.VITE_BASE_URL': JSON.stringify('')
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: true,
      sourcemap: false,
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      }
    },
    server: {
      port: 5173,
      host: true
    }
  }
})
`;

console.log('Writing forced vite.config.js');
fs.writeFileSync(viteConfigPath, viteConfig, 'utf8');

// Create a special main.jsx that logs environment variables clearly
const mainJsxPath = path.join(__dirname, 'client', 'src', 'main.jsx');
if (fs.existsSync(mainJsxPath)) {
  console.log('Adding environment variable debugging to main.jsx');
  
  const mainJsxContent = fs.readFileSync(mainJsxPath, 'utf8');
  const updatedMainJsx = mainJsxContent.replace(
    /import App from/,
    `
// EMERGENCY FIX: Force environment variables
window.VITE_API_URL = '/api';
window.VITE_SOCKET_URL = '/';
window.VITE_BASE_URL = '';

// Log environment variables on startup
console.log('EMERGENCY FIXED ENV VARS:', {
  VITE_API_URL: '/api',
  VITE_SOCKET_URL: '/',
  VITE_BASE_URL: ''
});

import App from`
  );
  
  fs.writeFileSync(mainJsxPath, updatedMainJsx, 'utf8');
}

// Create a special axios configuration file
const axiosConfigPath = path.join(__dirname, 'client', 'src', 'config', 'axios.js');
if (fs.existsSync(axiosConfigPath)) {
  console.log('Fixing axios configuration');
  
  const axiosConfig = `import axios from "axios";

// EMERGENCY FIX: Force the base URL
const API_URL = '/api';

console.log("EMERGENCY FIX: Using forced API URL:", API_URL);

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
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    
    // Log request for debugging
    console.log(\`\${config.method.toUpperCase()} \${config.baseURL}\${config.url}\`);
    
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

export default instance;`;
  
  fs.writeFileSync(axiosConfigPath, axiosConfig, 'utf8');
}

console.log('Emergency fix completed!');