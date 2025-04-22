#!/bin/bash
set -e

# Print Node.js version for debugging
echo "Using Node.js $(node --version)"

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Set NODE_OPTIONS to fix potential crypto issues with Vite
export NODE_OPTIONS="--no-experimental-fetch --openssl-legacy-provider"

# Build client
npm run build
cd ..

# Install server dependencies
cd server
npm install

# Create public directory in server
mkdir -p public

# Copy client build to server/public
cp -r ../client/dist/* public/

echo "Build completed successfully!"