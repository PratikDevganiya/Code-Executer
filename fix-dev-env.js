#!/usr/bin/env node

/**
 * Development Environment Setup Script
 * Sets up the environment for local development
 */

const fs = require('fs');
const path = require('path');

console.log('Setting up development environment...');

// Clean up any leftover variables from emergency-fix
const mainJsxPath = path.join(__dirname, 'client', 'src', 'main.jsx');
if (fs.existsSync(mainJsxPath)) {
  console.log('Cleaning up emergency fix code from main.jsx...');
  
  const mainJsxContent = fs.readFileSync(mainJsxPath, 'utf8');
  
  // Remove emergency fix code if present
  if (mainJsxContent.includes('EMERGENCY FIX:')) {
    const cleanedContent = mainJsxContent
      .replace(/\/\/ EMERGENCY FIX:.*?\n/g, '')
      .replace(/window\.VITE_API_URL.*?\n/g, '')
      .replace(/window\.VITE_SOCKET_URL.*?\n/g, '')
      .replace(/window\.VITE_BASE_URL.*?\n/g, '')
      .replace(/console\.log\('EMERGENCY FIXED ENV VARS.*?\);\n/g, '');
    
    fs.writeFileSync(mainJsxPath, cleanedContent, 'utf8');
    console.log('✅ Cleaned up main.jsx');
  }
}

// Create development .env file with correct values
const envDevContent = `VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_BASE_URL=

# Build configurations
NODE_ENV=development
BUILD_MODE=development`;

// Write to .env file
const envPath = path.join(__dirname, 'client', '.env');
console.log('Writing development values to .env:');
console.log(envDevContent);
fs.writeFileSync(envPath, envDevContent, 'utf8');

console.log('Development environment setup complete!');
console.log('To run the development server, use: cd client && npm run dev');
console.log('To run the server, use: cd server && npm start');
console.log('Remember to start both the client and server for full functionality.');