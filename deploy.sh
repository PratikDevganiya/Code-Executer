#!/bin/bash

# ===========================================
# Improved CodeBoost Deployment Script
# ===========================================

echo "=== Starting CodeBoost Deployment Process ==="

# Ensure we start with clean environment
echo "Cleaning up any previous builds..."
rm -rf client/dist
rm -rf server/public

# Apply fixes first
echo "Applying all fixes..."
node fix-prod-build.js
node fix-server-cors.js
node fix-urls.js
node fix-direct-urls.js
node emergency-fix.js

# Build the client
echo "Building client..."
cd client
npm install
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "Client build failed!"
  exit 1
fi

# Set up server
echo "Setting up server..."
cd ../server
npm install

# Copy client build to server
echo "Copying client build to server..."
mkdir -p public
cp -r ../client/dist/* public/

echo "=== Deployment build completed successfully ==="
echo "The application is now ready to be deployed to Render.com"
echo "Run 'git add . && git commit -m \"Deployment build\" && git push' to deploy"