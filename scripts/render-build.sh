#!/bin/bash
set -e

echo "Starting Render build"

echo "Setting up client production environment"
cd client
cat > .env << 'EOF'
VITE_API_URL=/api
VITE_SOCKET_URL=/
VITE_BASE_URL=

# Build configurations
BUILD_SSR=false
BUILD_MODE=production
EOF

echo "Installing and building client"
npm ci
export NODE_OPTIONS="--openssl-legacy-provider"
npm run build

echo "Installing server dependencies"
cd ../server
npm ci

echo "Copying client build into server/public"
mkdir -p public
rm -rf public/*
cp -R ../client/dist/. public/

echo "Render build completed"
