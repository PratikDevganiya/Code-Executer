#!/bin/bash

echo "Starting server and client for local development"

cd server
npm start &
SERVER_PID=$!

sleep 3

cd ../client
npm run dev

kill $SERVER_PID
