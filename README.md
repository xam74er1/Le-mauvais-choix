# Multiplayer Trivia Game

A real-time multiplayer trivia game where a game master poses questions, players submit deceptive fake answers, and everyone votes on which answer they think is correct. Players earn points based on how many people vote for their fake answers.

## Features

- Real-time multiplayer gameplay via WebSockets
- Game master controls for questions and game flow
- Player scoring system based on deceptive answers
- Session-based games with unique session codes
- Docker containerized deployment

## Tech Stack

- **Backend**: Python FastAPI with WebSocket support
- **Frontend**: React with real-time WebSocket client
- **Deployment**: Docker containers with docker-compose
- **Real-time Communication**: WebSockets for live updates

## Quick Start

### Development Setup

1. Clone the repository
2. **For Production Deployment:**
   ```bash
   # Windows
   start-prod.bat
   
   # Linux/Mac
   ./start-prod.sh
   
   # Or manually
   docker-compose up --build
   ```
   Access the application at: http://localhost

3. **For Development:**
   ```bash
   # Windows
   start-dev.bat
   
   # Linux/Mac  
   ./start-dev.sh
   
   # Or manually
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```
   Access the application at:
   - Frontend (Dev): http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Game Flow

1. **Game Master** creates a session and receives a session code
2. **Players** join using the session code and a pseudonym
3. **Game Master** poses a question with the correct answer
4. **Players** submit fake answers that look plausible
5. **Everyone** (including game master) votes on which answer is correct
6. **Results** are revealed showing vote counts and correct answer
7. **Players** earn points equal to votes received for their fake answers
8. Repeat with new questions

## API Endpoints

- `POST /sessions` - Create new game session
- `POST /sessions/{session_id}/join` - Join existing session
- `GET /sessions/{session_id}/state` - Get current game state
- `POST /sessions/{session_id}/questions` - Submit question (game master)
- `POST /sessions/{session_id}/answers` - Submit fake answer
- `POST /sessions/{session_id}/votes` - Submit vote
- `WS /ws/{session_id}/{player_id}` - WebSocket connection

## Project Structure

```
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── websocket.py    # WebSocket manager
│   │   ├── models/         # Data models
│   │   └── tests/          # Backend tests
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend container
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   ├── package.json       # Node dependencies
│   └── Dockerfile         # Frontend container
├── docker-compose.yml     # Development environment
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details