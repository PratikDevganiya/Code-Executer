#!/bin/bash

# Stop the script if any command fails
set -e

echo "🚀 Starting deployment process..."

# Step 1: Build the client
echo "📦 Building client..."
cd client
npm run build
cd ..

# Step 2: Create or clean the server's public directory
echo "🧹 Preparing server's public directory..."
rm -rf server/public
mkdir -p server/public

# Step 3: Copy the client build to the server's public directory
echo "📋 Copying client build to server..."
cp -r client/dist/* server/public/

# Step 4: Setup the server to serve static files
echo "✅ Deployment preparation complete!"
echo "Run 'cd server && npm start' to start the application"

# Note: You can add a 'npm install' step if needed