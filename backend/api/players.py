from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from uuid import UUID
from typing import List

from db.database import get_db
from db.queries import get_all_players, get_available_players

router = APIRouter(prefix="/api/players", tags=["players"])


class PlayerResponse(BaseModel):
    id: UUID
    name: str
    team: str
    position: str
    fantasy_pts: float
    pass_yds: int | None
    pass_td: int | None
    rush_yds: int | None
    rush_td: int | None
    rec_yds: int | None
    rec_td: int | None
    fg_made: int | None
    xp_made: int | None
    sacks: int | None
    ints: int | None
    image_url: str | None
    
    class Config:
        from_attributes = True


class PlayersListResponse(BaseModel):
    players: List[PlayerResponse]


@router.get("", response_model=PlayersListResponse)
async def get_players(
    db: AsyncSession = Depends(get_db)
) -> PlayersListResponse:
    players = await get_all_players(db)
    return PlayersListResponse(players=[PlayerResponse.model_validate(p) for p in players])


@router.get("/rooms/{room_id}/available", response_model=PlayersListResponse)
async def get_available_players_for_room(
    room_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> PlayersListResponse:
    players = await get_available_players(db, room_id)
    return PlayersListResponse(players=[PlayerResponse.model_validate(p) for p in players])

