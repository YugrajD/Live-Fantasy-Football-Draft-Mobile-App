from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from uuid import UUID
from typing import List, Dict

from db.database import get_db
from db.queries import get_picks_by_room, get_teams_by_room
from api.players import PlayerResponse

router = APIRouter(prefix="/api/rooms", tags=["picks"])


class PickResponse(BaseModel):
    pick_number: int
    user_name: str
    player: PlayerResponse
    picked_at: str


class PicksListResponse(BaseModel):
    picks: List[PickResponse]


class TeamsResponse(BaseModel):
    teams: Dict[str, List[PlayerResponse]]


@router.get("/{room_id}/picks", response_model=PicksListResponse)
async def get_picks(
    room_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> PicksListResponse:
    picks = await get_picks_by_room(db, room_id)
    picks_data = [
        PickResponse(
            pick_number=pick.pick_number,
            user_name=pick.participant.user_name,
            player=PlayerResponse.model_validate(pick.player),
            picked_at=pick.picked_at.isoformat()
        )
        for pick in picks
    ]
    return PicksListResponse(picks=picks_data)


@router.get("/{room_id}/teams", response_model=TeamsResponse)
async def get_teams(
    room_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> TeamsResponse:
    teams = await get_teams_by_room(db, room_id)
    teams_data = {
        user_name: [PlayerResponse.model_validate(p) for p in players]
        for user_name, players in teams.items()
    }
    return TeamsResponse(teams=teams_data)

