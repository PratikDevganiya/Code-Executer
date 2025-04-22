#!/bin/bash

# Stop the script if any command fails
set -e

echo "🚀 Starting deployment process..."

# Step 1: Install client dependencies
echo "📥 Installing client dependencies..."
cd client
npm install

# Step 2: Build the client
echo "📦 Building client..."
npm run build
cd ..

# Step 3: Install server dependencies
echo "📥 Installing server dependencies..."
cd server
npm install
cd ..

# Step 4: Create or clean the server's public directory
echo "🧹 Preparing server's public directory..."
rm -rf server/public
mkdir -p server/public

# Step 5: Copy the client build to the server's public directory
echo "📋 Copying client build to server..."
cp -r client/dist/* server/public/

# Step 6: Setup the server to serve static files
echo "✅ Deployment preparation complete!"
echo "Run 'cd server && npm start' to start the application"

# Note: You can add a 'npm install' step if needed