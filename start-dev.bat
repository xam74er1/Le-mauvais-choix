@echo off
echo 🎯 Starting Multiplayer Trivia Game Development Environment
echo ==================================================

echo 🐳 Building and starting containers...
docker-compose up --build

echo 🎮 Game should be available at:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs

pause