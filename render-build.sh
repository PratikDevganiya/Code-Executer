#!/bin/bash
set -e

# Print Node.js version for debugging
echo "Using Node.js $(node --version)"

# Install dependencies
npm install

# Install client dependencies and build
cd client
npm install

# Fix potential crypto issues with Vite
export NODE_OPTIONS="--no-experimental-fetch --openssl-legacy-provider"

# Build client
npm run build

# List the dist directory to check file existence
echo "Client build files:"
ls -la dist/

# Go back to root directory
cd ..

# Install server dependencies
cd server
npm install

# Create public directory in server
mkdir -p public

# Copy client build to server/public with verbose output
echo "Copying files from ../client/dist/* to public/"
cp -rv ../client/dist/* public/

# Verify the files were copied correctly
echo "Server public directory:"
ls -la public/

# List the parent directories to understand the structure
echo "Directory structure:"
ls -la
ls -la ../
ls -la ../../

echo "Build completed successfully!"