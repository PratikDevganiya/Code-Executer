#!/bin/bash

# =========================================
# Development Environment Startup Script
# =========================================

echo "=== Setting up development environment ==="

# Apply development environment fixes
echo "Setting up development configuration..."
node fix-dev-env.js

# Start server in background
echo "Starting server..."
cd server
npm start &
SERVER_PID=$!

# Wait a bit for the server to start
sleep 3

# Start client in development mode
echo "Starting client development server..."
cd ../client
npm run dev

# When client is stopped, stop the server too
kill $SERVER_PID