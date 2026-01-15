from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import Optional, List
from db.models import DraftRoom, Participant, Player, Pick


async def get_room(db: AsyncSession, room_id: UUID) -> Optional[DraftRoom]:
    result = await db.execute(
        select(DraftRoom)
        .options(selectinload(DraftRoom.participants))
        .where(DraftRoom.id == room_id)
    )
    return result.scalar_one_or_none()


async def get_room_by_code(db: AsyncSession, code: str) -> Optional[DraftRoom]:
    result = await db.execute(
        select(DraftRoom)
        .options(selectinload(DraftRoom.participants))
        .where(DraftRoom.code == code)
    )
    return result.scalar_one_or_none()


async def get_participant(db: AsyncSession, room_id: UUID, user_name: str) -> Optional[Participant]:
    result = await db.execute(
        select(Participant)
        .where(and_(Participant.room_id == room_id, Participant.user_name == user_name))
    )
    return result.scalar_one_or_none()


async def get_participants_by_room(db: AsyncSession, room_id: UUID) -> List[Participant]:
    result = await db.execute(
        select(Participant)
        .where(Participant.room_id == room_id)
        .order_by(Participant.draft_position)
    )
    return list(result.scalars().all())


async def get_player(db: AsyncSession, player_id: UUID) -> Optional[Player]:
    result = await db.execute(select(Player).where(Player.id == player_id))
    return result.scalar_one_or_none()


async def get_all_players(db: AsyncSession) -> List[Player]:
    result = await db.execute(select(Player).order_by(Player.fantasy_pts.desc()))
    return list(result.scalars().all())


async def is_player_drafted(db: AsyncSession, room_id: UUID, player_id: UUID) -> bool:
    result = await db.execute(
        select(Pick)
        .where(and_(Pick.room_id == room_id, Pick.player_id == player_id))
    )
    return result.scalar_one_or_none() is not None


async def get_available_players(db: AsyncSession, room_id: UUID) -> List[Player]:
    # Get all drafted player IDs for this room
    drafted_result = await db.execute(
        select(Pick.player_id).where(Pick.room_id == room_id)
    )
    drafted_ids = set(drafted_result.scalars().all())
    
    # Get all players not in drafted list
    if drafted_ids:
        result = await db.execute(
            select(Player)
            .where(~Player.id.in_(drafted_ids))
            .order_by(Player.fantasy_pts.desc())
        )
    else:
        result = await db.execute(
            select(Player).order_by(Player.fantasy_pts.desc())
        )
    
    return list(result.scalars().all())


async def get_picks_by_room(db: AsyncSession, room_id: UUID) -> List[Pick]:
    result = await db.execute(
        select(Pick)
        .options(selectinload(Pick.player), selectinload(Pick.participant))
        .where(Pick.room_id == room_id)
        .order_by(Pick.pick_number)
    )
    return list(result.scalars().all())


async def get_teams_by_room(db: AsyncSession, room_id: UUID) -> dict:
    picks = await get_picks_by_room(db, room_id)
    teams = {}
    
    for pick in picks:
        user_name = pick.participant.user_name
        if user_name not in teams:
            teams[user_name] = []
        teams[user_name].append(pick.player)
    
    return teams

