#!/bin/bash
set -e

echo "Starting Render build"

echo "Setting up client production environment"
cd client
cp .env.production .env

echo "Installing and building client"
npm install
export NODE_OPTIONS="--openssl-legacy-provider"
npm run build

echo "Installing server dependencies"
cd ../server
npm install

echo "Copying client build into server/public"
mkdir -p public
rm -rf public/*
cp -R ../client/dist/. public/

echo "Render build completed"
