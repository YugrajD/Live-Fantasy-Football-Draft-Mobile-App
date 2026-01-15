from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.database import init_db
from api import rooms, players, picks, websocket
from seed.players import SEED_PLAYERS
from db.models import Player
from db.database import async_session


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    
    # Seed players if database is empty
    async with async_session() as session:
        from sqlalchemy import select
        result = await session.execute(select(Player))
        existing_players = result.scalars().all()
        
        if len(existing_players) == 0:
            for player_data in SEED_PLAYERS:
                player = Player(**player_data)
                session.add(player)
            await session.commit()
            print("Seeded player data")
    
    yield
    
    # Shutdown (if needed)
    pass


app = FastAPI(title="Fantasy Football Draft API", lifespan=lifespan)

# CORS middleware for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(rooms.router)
app.include_router(players.router)
app.include_router(picks.router)
app.include_router(websocket.router)


@app.get("/")
async def root():
    return {"message": "Fantasy Football Draft API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

