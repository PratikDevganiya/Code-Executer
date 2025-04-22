#!/bin/bash
set -e

echo "=========== STARTING BUILD PROCESS ==========="

# Print Node.js version for debugging
echo "Using Node.js $(node --version)"

# Show current directory and structure
echo "Current working directory: $(pwd)"
ls -la

# Install root dependencies
echo "=========== INSTALLING ROOT DEPENDENCIES ==========="
npm install

# Install client dependencies and build
echo "=========== BUILDING CLIENT ==========="
cd client
npm install

# Fix potential crypto issues with Vite
export NODE_OPTIONS="--no-experimental-fetch --openssl-legacy-provider"

# Build client
npm run build

# Show what was built
echo "Client dist directory content:"
ls -la dist/

# Go back to root
cd ..

# Install server dependencies
echo "=========== SETTING UP SERVER ==========="
cd server
npm install

# Create public directory in server
mkdir -p public

# Show absolute paths for clarity
echo "Path to client dist: $(cd .. && pwd)/client/dist"
echo "Path to server public: $(pwd)/public"

# Copy client build to server/public with verbose output
echo "=========== COPYING BUILD FILES ==========="
cp -rv ../client/dist/* public/

# Verify the files were copied correctly
echo "Server public directory content:"
ls -la public/

# Create a test index.html if it doesn't exist (as a fallback)
if [ ! -f "public/index.html" ]; then
  echo "WARNING: index.html not found! Creating a placeholder..."
  echo "<html><head><title>CodeBoost</title></head><body><h1>CodeBoost Application</h1><p>Something went wrong with the build process. The index.html file is missing.</p></body></html>" > public/index.html
  echo "Created placeholder index.html:"
  cat public/index.html
fi

echo "=========== BUILD COMPLETED ==========="