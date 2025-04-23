#!/usr/bin/env node

/**
 * Comprehensive fix script for production build
 * This script ensures all API URLs are correctly set for production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting comprehensive production build fix...');

// 1. Make sure .env.production has the correct values
const envProdPath = path.join(__dirname, 'client', '.env.production');
const envProdContent = `VITE_API_URL=/api
VITE_SOCKET_URL=/
VITE_BASE_URL=

# Build configurations
NODE_ENV=production
BUILD_SSR=false
BUILD_MODE=production`;

console.log('Updating .env.production with correct values:');
console.log(envProdContent);
fs.writeFileSync(envProdPath, envProdContent, 'utf8');

// 2. Also update the regular .env file
const envPath = path.join(__dirname, 'client', '.env');
console.log('Copying production values to .env');
fs.writeFileSync(envPath, envProdContent, 'utf8');

// 3. Fix apiConfig.js to ensure it uses environment variables properly
const apiConfigPath = path.join(__dirname, 'client', 'src', 'config', 'apiConfig.js');
if (fs.existsSync(apiConfigPath)) {
  console.log('Updating API configuration...');
  
  const apiConfigContent = `// API URL Configuration
const API_URL = '/api';  // Force production path
const SOCKET_URL = '/';  // Force production socket path
const BASE_URL = '';     // Force production base URL

// Log forced configuration
console.log('Production API Configuration:', {
  API_URL,
  SOCKET_URL,
  BASE_URL,
  EXECUTE_URL: '/execute',
});

// Determine execute URL
const getExecuteUrl = () => '/execute';

// Create paths
export const ENDPOINTS = {
  AUTH: {
    LOGIN: \`\${API_URL}/users/login\`,
    REGISTER: \`\${API_URL}/users/register\`,
    PROFILE: \`\${API_URL}/users/profile\`,
    UPDATE: \`\${API_URL}/users/update\`,
    TEST: \`\${API_URL}/users/test\`,
  },
  CODE: {
    EXECUTE: getExecuteUrl(),
    SUBMISSIONS: \`\${API_URL}/code/submissions\`,
    COLLABORATIONS: \`\${API_URL}/code/collaborations\`,
  },
  SHARE: {
    CREATE: \`\${API_URL}/share\`,
    GET: (id) => \`\${API_URL}/share/\${id}\`,
  },
  FILES: {
    LIST: \`\${API_URL}/files\`,
    GET: (id) => \`\${API_URL}/files/\${id}\`,
    CREATE: \`\${API_URL}/files\`,
    UPDATE: (id) => \`\${API_URL}/files/\${id}\`,
    DELETE: (id) => \`\${API_URL}/files/\${id}\`,
  },
  SOCKET: SOCKET_URL,
};

export default ENDPOINTS;`;
  
  fs.writeFileSync(apiConfigPath, apiConfigContent, 'utf8');
}

// 4. Fix axios.js to use hardcoded production URLs
const axiosPath = path.join(__dirname, 'client', 'src', 'config', 'axios.js');
if (fs.existsSync(axiosPath)) {
  console.log('Updating axios configuration...');
  
  const axiosContent = `import axios from "axios";

// Production configuration - hardcoded for reliability
const API_URL = '/api';

console.log("Using API URL:", API_URL);

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach token
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

// Response interceptor for handling errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error: Please check your connection or server availability');
    }
    
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    
    // Handle CORS errors
    if (error.message?.includes('Network Error') || error.message?.includes('CORS')) {
      console.error('This may be a CORS issue. Check server configuration.');
    }
    
    return Promise.reject(error);
  }
);

export default instance;`;
  
  fs.writeFileSync(axiosPath, axiosContent, 'utf8');
}

// 5. Update CodeEditor.jsx to use correct socket and execute URLs
const codeEditorPath = path.join(__dirname, 'client', 'src', 'pages', 'CodeEditor.jsx');
if (fs.existsSync(codeEditorPath)) {
  console.log('Fixing CodeEditor.jsx...');
  
  let content = fs.readFileSync(codeEditorPath, 'utf8');
  
  // Fix Socket URL
  content = content.replace(
    /const socketUrl = import\.meta\.env\.VITE_SOCKET_URL \|\| ['"]http:\/\/localhost:5001['"]/g,
    `const socketUrl = '/'`
  );
  
  // Fix Execute URL - more careful replacement pattern
  content = content.replace(
    /const executeUrl = .*?;/s,
    `const executeUrl = '/execute';`
  );
  
  fs.writeFileSync(codeEditorPath, content, 'utf8');
}

// 6. Update CollaborativeEditor.jsx to use correct socket URL
const collabEditorPath = path.join(__dirname, 'client', 'src', 'components', 'CollaborativeEditor.jsx');
if (fs.existsSync(collabEditorPath)) {
  console.log('Fixing CollaborativeEditor.jsx...');
  
  let content = fs.readFileSync(collabEditorPath, 'utf8');
  
  // Fix Socket URL
  content = content.replace(
    /const socketUrl = import\.meta\.env\.VITE_SOCKET_URL \|\| ['"].*?['"]/g,
    `const socketUrl = '/'`
  );
  
  fs.writeFileSync(collabEditorPath, content, 'utf8');
}

// 7. Update vite.config.js to force environment variables
const viteConfigPath = path.join(__dirname, 'client', 'vite.config.js');
if (fs.existsSync(viteConfigPath)) {
  console.log('Updating Vite configuration...');
  
  const viteConfigContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  define: {
    // Force environment variables for production
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
});`;
  
  fs.writeFileSync(viteConfigPath, viteConfigContent, 'utf8');
}

console.log('All production fixes applied successfully!');