# Live Fantasy Football Draft Demo

A real-time fantasy football draft application demonstrating multiplayer WebSocket synchronization, event-driven architecture, and full-stack development skills.

## Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Python FastAPI
- **Database:** PostgreSQL
- **Real-time:** WebSockets (native FastAPI support)
- **Queue:** AWS SQS via LocalStack (for async post-draft processing)
- **Containerization:** Docker + Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js and npm (for frontend development)

### Backend Setup

1. Start all services:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- LocalStack (SQS) on port 4566
- FastAPI backend on port 8000
- Worker process for SQS queue

2. The backend will automatically:
   - Create database tables
   - Seed player data (~50 NFL players)
   - Initialize SQS queue

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start Expo development server:
```bash
npm start
```

4. Run on your device:
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator / `a` for Android emulator

## Testing the Flow

1. **Create Room:**
   - Open app on device 1
   - Enter your name and room name
   - Click "Create Room"
   - Note the room code (e.g., "ABCD")

2. **Join Room:**
   - Open app on device 2
   - Enter your name and the room code
   - Click "Join Room"

3. **Start Draft:**
   - Host clicks "Start Draft" in lobby
   - Both devices navigate to draft screen

4. **Make Picks:**
   - Players take turns selecting players
   - Real-time updates sync across all devices
   - Timer counts down (30 seconds default)
   - Auto-pick occurs if timer expires

5. **View Results:**
   - After all picks, view final teams
   - Teams ranked by total fantasy points
   - SQS worker processes results in background

## API Endpoints

### REST Endpoints

- `POST /api/rooms` - Create a new draft room
- `GET /api/rooms/{room_id}` - Get room details
- `GET /api/rooms/code/{code}` - Get room by code
- `POST /api/rooms/{room_id}/join` - Join a room
- `POST /api/rooms/{room_id}/start` - Start the draft
- `GET /api/players` - Get all players
- `GET /api/players/rooms/{room_id}/available` - Get available players
- `GET /api/rooms/{room_id}/picks` - Get all picks
- `GET /api/rooms/{room_id}/teams` - Get final teams

### WebSocket

- `WS /ws/{room_id}/{user_name}` - Real-time draft updates

## Project Structure

```
├── backend/
│   ├── api/              # REST API endpoints
│   ├── db/               # Database models and queries
│   ├── websocket/        # WebSocket handlers
│   ├── services/         # Business logic (draft, timer, queue)
│   ├── worker/           # SQS consumer
│   └── seed/             # Player seed data
│
├── frontend/
│   ├── screens/          # App screens
│   ├── components/       # Reusable components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API client
│   └── types/            # TypeScript types
│
└── docker-compose.yml    # Service orchestration
```

## Features

- ✅ Real-time multiplayer synchronization via WebSockets
- ✅ Snake draft order (1,2,3,4,4,3,2,1...)
- ✅ Pick timer with auto-pick on timeout
- ✅ Live pick feed and team rosters
- ✅ Event-driven architecture with SQS
- ✅ Async worker processing
- ✅ Responsive mobile UI

## Development Notes

- Backend runs on `http://localhost:8000`
- Frontend connects to backend via `http://localhost:8000` (change in `frontend/services/api.ts` for production)
- WebSocket URL: `ws://localhost:8000/ws/{room_id}/{user_name}`
- Database auto-creates tables on first run
- Player data seeds automatically if database is empty

## Troubleshooting

- **WebSocket connection fails:** Ensure backend is running and accessible
- **Database errors:** Check Docker containers are running (`docker-compose ps`)
- **Frontend can't connect:** Verify API_BASE_URL in `frontend/services/api.ts`
- **SQS not working:** Check LocalStack logs (`docker-compose logs localstack`)

## License

MIT
