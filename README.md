# Live Fantasy Football Draft Demo

A real-time multiplayer fantasy football draft application showcasing WebSocket synchronization, event-driven architecture, and full-stack development. Built for demonstrating technical capabilities in real-time systems, distributed architecture, and mobile app development.

## 🎯 Features

- **Real-time Multiplayer Draft** - Live synchronization across multiple devices via WebSockets
- **Snake Draft Order** - Traditional fantasy draft format (1,2,3,4,4,3,2,1...)
- **Live Updates** - Real-time pick feed, team rosters, and turn indicators
- **Event-Driven Architecture** - SQS queue for async post-draft processing
- **Modern Mobile UI** - Dark theme, professional design, responsive layout
- **Multi-Device Support** - Same user can connect from multiple devices simultaneously

## 🛠 Tech Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **WebSocket** for real-time communication

### Backend
- **Python FastAPI** - Modern async web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** (async) - ORM
- **WebSockets** - Native FastAPI support
- **AWS SQS** (via LocalStack) - Message queue for async processing

### Infrastructure
- **Docker & Docker Compose** - Containerization and orchestration
- **LocalStack** - Local AWS services for development

## 📋 Prerequisites

- **Docker** and **Docker Compose** (for backend services)
- **Node.js** 18+ and **npm** (for frontend)
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **Expo Go** app on your mobile device (iOS/Android)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Live-Fantasy-Football-Draft-Mobile-App
```

### 2. Start Backend Services

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on port `5432`
- **LocalStack** (SQS) on port `4566`
- **FastAPI Backend** on port `8000`
- **Worker Process** for SQS queue consumption

The backend will automatically:
- Create database tables on first run
- Seed ~50 NFL players with stats
- Initialize SQS queue

### 3. Configure Network (For Physical Devices)

**Important:** For testing on physical devices, update the IP address in the frontend config:

1. Find your computer's local IP:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. Update `frontend/src/config.ts`:
   ```typescript
   const LOCAL_IP = '10.0.0.232'; // <- Change to your IP
   ```

### 4. Start Frontend

```bash
cd frontend
npm install
npm start
```

### 5. Run on Device

- **Physical Device:** Scan QR code with Expo Go app
- **iOS Simulator:** Press `i` in terminal
- **Android Emulator:** Press `a` in terminal

## 📱 Usage Flow

### Creating a Room

1. Open app on your device
2. Enter your display name and room name
3. Tap "Create Room"
4. Note the room code (e.g., "ABCD")

### Joining a Room

1. Open app on another device (or same device with different name)
2. Enter your display name and the room code
3. Tap "Join Room"
4. Wait in lobby for host to start

### Starting the Draft

1. Host taps "Start Draft" in lobby
2. All participants automatically navigate to draft screen
3. Draft begins with first player's turn

### Making Picks

1. When it's your turn, timer appears (30 seconds)
2. Search for players by name
3. Tap a player card to select
4. Confirm your pick
5. Next player's turn begins automatically

### Viewing Results

- After all picks complete, view final team rosters
- Teams ranked by total fantasy points
- SQS worker processes results in background

## 🏗 Architecture

### System Components

```
┌─────────────┐
│   Mobile    │
│   Clients   │
└──────┬──────┘
       │ WebSocket
       │ REST API
┌──────▼─────────────────┐
│   FastAPI Backend      │
│  - REST Endpoints      │
│  - WebSocket Manager   │
│  - Draft Logic         │
│  - Timer Service       │
└──────┬─────────────────┘
       │
       ├──────────┬──────────┐
       │          │          │
┌──────▼──┐ ┌────▼────┐ ┌───▼──────┐
│PostgreSQL│ │LocalStack│ │  Worker  │
│ Database │ │   SQS    │ │ Process  │
└──────────┘ └──────────┘ └──────────┘
```

### WebSocket Events

**Client → Server:**
- `pick` - Make a draft pick

**Server → Client:**
- `sync` - Full state sync on connect
- `user_joined` - Participant joined room
- `user_left` - Participant left room
- `draft_started` - Draft has begun
- `pick_made` - A pick was made
- `timer_tick` - Timer countdown update
- `draft_complete` - Draft finished

### Database Schema

- **draft_rooms** - Room configuration and status
- **participants** - Room participants and draft positions
- **players** - NFL player data with stats
- **picks** - Draft selections (room, participant, player, pick number)

## 📡 API Endpoints

### REST API

**Rooms:**
- `POST /api/rooms` - Create room
- `GET /api/rooms/{room_id}` - Get room details
- `GET /api/rooms/code/{code}` - Get room by code
- `POST /api/rooms/{room_id}/join` - Join room
- `POST /api/rooms/{room_id}/start` - Start draft

**Players:**
- `GET /api/players` - Get all players
- `GET /api/players/rooms/{room_id}/available` - Get available players

**Picks:**
- `GET /api/rooms/{room_id}/picks` - Get all picks
- `GET /api/rooms/{room_id}/teams` - Get final teams

### WebSocket

- `WS /ws/{room_id}/{user_name}` - Connect to room

## 📁 Project Structure

```
├── backend/
│   ├── api/              # REST API endpoints
│   │   ├── rooms.py      # Room management
│   │   ├── players.py    # Player data
│   │   ├── picks.py      # Pick history
│   │   └── websocket.py  # WebSocket endpoint
│   ├── db/               # Database layer
│   │   ├── models.py     # SQLAlchemy models
│   │   ├── queries.py    # Database queries
│   │   └── database.py   # Connection setup
│   ├── websocket/        # WebSocket handlers
│   │   ├── manager.py   # Connection management
│   │   └── handlers.py   # Message handlers
│   ├── services/         # Business logic
│   │   ├── draft.py      # Draft order & validation
│   │   ├── timer.py      # Pick timer logic
│   │   └── queue.py      # SQS integration
│   ├── worker/           # Background worker
│   │   └── worker.py     # SQS consumer
│   ├── seed/             # Seed data
│   │   └── players.py    # NFL player data
│   └── main.py           # FastAPI app entry
│
├── frontend/
│   ├── screens/          # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── LobbyScreen.tsx
│   │   ├── DraftScreen.tsx
│   │   └── ResultsScreen.tsx
│   ├── components/       # Reusable components
│   │   ├── PlayerCard.tsx
│   │   ├── Timer.tsx
│   │   └── TurnIndicator.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useWebSocket.ts
│   │   └── useDraftState.ts
│   ├── services/         # API client
│   │   └── api.ts
│   ├── src/              # Configuration
│   │   ├── config.ts     # API/WS URLs
│   │   └── theme.ts      # Design system
│   └── types/            # TypeScript types
│       └── index.ts
│
├── localstack/           # LocalStack init scripts
│   └── init-sqs.sh
│
└── docker-compose.yml    # Service orchestration
```

## ⚙️ Configuration

### Backend Environment Variables

Set in `docker-compose.yml`:
- `DATABASE_URL` - PostgreSQL connection string
- `SQS_ENDPOINT` - LocalStack SQS endpoint
- `SQS_QUEUE_URL` - SQS queue URL

### Frontend Configuration

Edit `frontend/src/config.ts`:
```typescript
const LOCAL_IP = '10.0.0.232'; // Your computer's local IP
const DEV_MODE = true;

export const config = {
  API_URL: DEV_MODE 
    ? `http://${LOCAL_IP}:8000/api`
    : 'https://your-production-url.com/api',
  
  WS_URL: DEV_MODE
    ? `ws://${LOC_IP}:8000/ws`
    : 'wss://your-production-url.com/ws',
};
```

## 🐛 Troubleshooting

### Backend Issues

**Services won't start:**
```bash
docker-compose down
docker-compose up -d
docker-compose logs backend
```

**Database connection errors:**
- Check PostgreSQL is healthy: `docker-compose ps db`
- Verify DATABASE_URL in docker-compose.yml

**WebSocket connection fails:**
- Ensure backend is running: `curl http://localhost:8000/api/players`
- Check backend logs: `docker-compose logs backend`

### Frontend Issues

**Can't connect to backend:**
- Verify `LOCAL_IP` in `frontend/src/config.ts` matches your computer's IP
- Ensure backend is accessible: `curl http://YOUR_IP:8000/api/players`
- Check firewall isn't blocking port 8000

**QR code shows "no usable data":**
- Update `LOCAL_IP` in config.ts to your computer's local network IP
- Restart Expo: `npm start` in frontend directory

**WebSocket 403 Forbidden:**
- Ensure display name matches when creating/joining room
- Check backend logs for connection errors

### SQS/LocalStack Issues

**Queue not working:**
```bash
docker-compose logs localstack
docker-compose restart localstack
```

## 🧪 Development

### Running Backend in Development

Backend auto-reloads on file changes (via `--reload` flag).

### Running Frontend in Development

Expo hot-reloads on save. Shake device or press `r` in terminal to reload.

### Database Migrations

Tables are auto-created on first run. For manual migrations, connect to PostgreSQL:
```bash
docker-compose exec db psql -U draft -d fantasy_draft
```

### Adding New Players

Edit `backend/seed/players.py` and restart backend to re-seed.

## 📝 API Documentation

Once backend is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 🎨 UI Design

The app uses a dark, professional theme inspired by EdgeSports:
- **Primary Color:** Green (#10b981) for CTAs and active states
- **Background:** Dark navy (#0a1128)
- **Cards:** Darker blue (#162038)
- **Text:** White/light gray for hierarchy

## 🔒 Security Notes

This is a demo application. For production:
- Add authentication/authorization
- Use HTTPS/WSS
- Validate and sanitize all inputs
- Implement rate limiting
- Add CORS configuration
- Secure database credentials
- Use environment variables for secrets

## 📄 License

MIT

## 👤 Author

Built as a technical demonstration of real-time systems, event-driven architecture, and full-stack mobile development.

---

**Need help?** Check the logs:
- Backend: `docker-compose logs backend`
- Frontend: Check Expo terminal output
- Database: `docker-compose logs db`
