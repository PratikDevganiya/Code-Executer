#!/usr/bin/env node

/**
 * Render.com Build Script
 * An all-in-one build script for Render deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Print a nice header
console.log('='.repeat(50));
console.log('STARTING RENDER.COM PRODUCTION BUILD PROCESS');
console.log('='.repeat(50));

// Utilities
const runCommand = (cmd, cwd = process.cwd()) => {
  console.log(`\n> ${cmd}\n`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing ${cmd}:`, error.message);
    return false;
  }
};

const copyDir = (src, dest) => {
  try {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      }
    }
    return true;
  } catch (error) {
    console.error(`Error copying directory:`, error.message);
    return false;
  }
};

// Step 0: Apply production fixes to client
console.log('\n\n📦 Step 0: Setting up environment variables...');

// Create production .env file
const clientEnvProdPath = path.join(__dirname, 'client', '.env.production');
const clientEnvPath = path.join(__dirname, 'client', '.env');

// Create .env.production if it doesn't exist
const envProdContent = `VITE_API_URL=/api
VITE_SOCKET_URL=/
VITE_BASE_URL=

# Build configurations
NODE_ENV=production
BUILD_MODE=production`;

// Write .env.production
console.log('Writing production environment variables:');
console.log(envProdContent);
fs.writeFileSync(clientEnvProdPath, envProdContent, 'utf8');

// Copy to .env for build
fs.writeFileSync(clientEnvPath, envProdContent, 'utf8');
console.log('✅ Environment variables set up');

// Update Vite config for production
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
  console.log('✅ Vite configuration updated');
}

// Fix axios.js to use production URLs
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
  console.log('✅ Axios configuration updated');
}

// Fix apiConfig.js to ensure it uses environment variables properly
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
  console.log('✅ API configuration updated');
}

// Step 1: Install root dependencies
console.log('\n\n📦 Step 1: Installing root dependencies...');
if (!runCommand('npm install')) {
  process.exit(1);
}

// Step 2: Build client
console.log('\n\n📦 Step 2: Building client...');
process.chdir('client');
if (!runCommand('npm install') || 
    !runCommand('export NODE_OPTIONS="--no-experimental-fetch --openssl-legacy-provider" && npm run build')) {
  console.log('Client build failed. Creating a fallback front-end...');
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  fs.writeFileSync('dist/index.html', `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CodeBoost</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; line-height: 1.6; }
        .alert { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .card { background: #f8f9fa; border: 1px solid #ddd; padding: 20px; border-radius: 4px; }
        .btn { display: inline-block; background: #254E58; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>CodeBoost</h1>
      <div class="alert">
        <h3>Frontend Build Error</h3>
        <p>The React application failed to build properly. This is a fallback page.</p>
      </div>
      <div class="card">
        <h3>You can still access the API</h3>
        <p>The backend API is still running and can be accessed.</p>
        <a href="/api/users/test" class="btn">Test API</a>
      </div>
    </body>
    </html>
  `);
}

// List what was built
console.log('\n\nClient build output:');
if (fs.existsSync('dist')) {
  runCommand('ls -la dist/');
} else {
  console.log('No dist directory found!');
}

// Step 3: Set up server
process.chdir('../server');
console.log('\n\n📦 Step 3: Setting up server...');

// Fix CORS in server.js
const serverPath = path.join(__dirname, 'server', 'server.js');
if (fs.existsSync(serverPath)) {
  console.log('Fixing CORS configuration in server.js...');
  
  let content = fs.readFileSync(serverPath, 'utf8');
  
  // Look for CORS configuration
  if (content.includes('cors(')) {
    // Replace CORS configuration with proper production settings
    let newContent = content.replace(
      /app\.use\(cors\([\s\S]*?\)\);/g,
      `app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // For all other origins, allow them
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));`
    );
    
    // Make sure the server uses the correct PORT from environment variable
    if (newContent.includes('const PORT = process.env.PORT || 5000')) {
      console.log('PORT configuration already correct');
    } else {
      // Fix the port configuration
      newContent = newContent.replace(
        /const PORT = .*?;/,
        `const PORT = process.env.PORT || 10000;`
      );
      console.log('✅ Updated PORT configuration in server.js');
    }
    
    // Add a console log to show which port the server is using
    if (!newContent.includes('console.log(`Server running on:')) {
      newContent = newContent.replace(
        /console\.log\(`🚀 Server running on port \${PORT}`\);/,
        `console.log(\`🚀 Server running on port \${PORT}\`);
console.log(\`Server environment: \${process.env.NODE_ENV || 'development'}\`);
console.log(\`Server running on: http://localhost:\${PORT}\`);`
      );
      console.log('✅ Added extra debugging logs for server startup');
    }
    
    fs.writeFileSync(serverPath, newContent, 'utf8');
    console.log('✅ Updated CORS configuration in server.js');
  } else {
    console.log('⚠️ Could not find CORS configuration in server.js');
  }
} else {
  console.log('⚠️ server.js not found');
}

// Add a health check endpoint if not already present
if (fs.existsSync(serverPath)) {
  console.log('Adding health check endpoint...');
  
  let content = fs.readFileSync(serverPath, 'utf8');
  
  if (!content.includes('/health-check')) {
    // Find a good spot to insert the health check endpoint
    let newContent = content;
    
    if (content.includes('// ✅ Test Route')) {
      // Insert after test route
      newContent = content.replace(
        /\/\/ ✅ Test Route.*?}\);/s,
        match => `${match}

// ✅ Health Check Endpoint for Render
app.get('/health-check', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});`
      );
    } else {
      // Insert before routes if test route not found
      newContent = content.replace(
        /\/\/ ✅ Import Routes/,
        `// ✅ Health Check Endpoint for Render
app.get('/health-check', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Import Routes`
      );
    }
    
    fs.writeFileSync(serverPath, newContent, 'utf8');
    console.log('✅ Added health check endpoint to server.js');
  } else {
    console.log('Health check endpoint already exists');
  }
}

// Update .env.production for server
const serverEnvPath = path.join(__dirname, 'server', '.env.production');
const serverEnvContent = `MONGODB_URI="mongodb+srv://pratik:pratik@codeboost.x2dnc.mongodb.net/?retryWrites=true&w=majority&appName=CodeBoost"
JWT_SECRET="mynameispratik"
PORT=${process.env.PORT || 10000}
CLIENT_URL="*"
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="76c5bc7fd3mshb8cb6886a11ac21p19f213jsnc397e9a89807"
`;

fs.writeFileSync(serverEnvPath, serverEnvContent, 'utf8');
console.log('✅ Updated server .env.production');

// Also update the regular .env file
fs.writeFileSync(path.join(__dirname, 'server', '.env'), serverEnvContent, 'utf8');
console.log('✅ Updated server .env');

if (!runCommand('npm install')) {
  process.exit(1);
}

// Step 4: Copy client build to server/public
console.log('\n\n📦 Step 4: Copying client build to server/public...');
if (fs.existsSync('public')) {
  runCommand('rm -rf public');
}
fs.mkdirSync('public', { recursive: true });

const clientDistPath = path.join(__dirname, 'client', 'dist');
const serverPublicPath = path.join(__dirname, 'server', 'public');

if (fs.existsSync(clientDistPath)) {
  console.log(`Copying from ${clientDistPath} to ${serverPublicPath}`);
  copyDir(clientDistPath, serverPublicPath);
  
  console.log('\nServer public directory now contains:');
  runCommand('ls -la public/');
} else {
  console.log('Client dist directory not found!');
  
  // Create a fallback index.html
  const indexPath = path.join(serverPublicPath, 'index.html');
  fs.writeFileSync(indexPath, `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CodeBoost</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; line-height: 1.6; }
        .alert { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .card { background: #f8f9fa; border: 1px solid #ddd; padding: 20px; border-radius: 4px; }
        .btn { display: inline-block; background: #254E58; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>CodeBoost</h1>
      <div class="alert">
        <h3>Frontend Build Error</h3>
        <p>The React application failed to build properly. This is a fallback page.</p>
      </div>
      <div class="card">
        <h3>You can still access the API</h3>
        <p>The backend API is still running and can be accessed.</p>
        <a href="/api/users/test" class="btn">Test API</a>
      </div>
    </body>
    </html>
  `);
  console.log('Created fallback index.html');
}

console.log('\n\n✅ Build process completed!');