#!/bin/bash

echo "🎯 Starting Multiplayer Trivia Game Production Environment"
echo "=================================================="

echo "🐳 Building and starting containers..."
docker-compose up --build

echo ""
echo "🎮 Game should be available at:"
echo "   Application: http://localhost"
echo "   (Backend API accessible via /api/ proxy)"