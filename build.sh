#!/bin/bash
set -e

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
npm run build
cd ..

# Install server dependencies
cd server
npm install

# Create public directory in server
mkdir -p public

# Copy client build to server/public
cp -r client/dist/* server/public/

echo "Build completed successfully!"