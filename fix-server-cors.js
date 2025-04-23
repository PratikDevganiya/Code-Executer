#!/usr/bin/env node

/**
 * Server CORS Fix Script
 * Ensures CORS is properly configured for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('Starting server CORS configuration fix...');

// Path to server.js
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
    
    fs.writeFileSync(serverPath, newContent, 'utf8');
    console.log('✅ Updated CORS configuration in server.js');
  } else {
    console.log('⚠️ Could not find CORS configuration in server.js');
  }
} else {
  console.log('⚠️ server.js not found');
}

// Update .env.production for server as well
const serverEnvPath = path.join(__dirname, 'server', '.env.production');
if (fs.existsSync(serverEnvPath)) {
  console.log('Updating server .env.production...');
  
  // Create or update the CLIENT_URL setting to allow all origins
  const envContent = `MONGODB_URI="mongodb+srv://pratik:pratik@codeboost.x2dnc.mongodb.net/?retryWrites=true&w=majority&appName=CodeBoost"
JWT_SECRET="mynameispratik"
PORT=10000
CLIENT_URL="*"
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="76c5bc7fd3mshb8cb6886a11ac21p19f213jsnc397e9a89807"
`;
  
  fs.writeFileSync(serverEnvPath, envContent, 'utf8');
  console.log('✅ Updated server .env.production');
  
  // Also update the regular .env file
  fs.writeFileSync(path.join(__dirname, 'server', '.env'), envContent, 'utf8');
  console.log('✅ Updated server .env');
}

console.log('Server CORS fix completed!');