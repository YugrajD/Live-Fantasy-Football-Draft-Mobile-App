from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
import random
import string

from db.database import get_db
from db.models import DraftRoom, Participant
from db.queries import get_room, get_room_by_code, get_participants_by_room, get_participant
from sqlalchemy import select

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


def generate_room_code() -> str:
    return ''.join(random.choices(string.ascii_uppercase, k=4))


class CreateRoomRequest(BaseModel):
    name: str
    host_name: str
    turn_time_sec: int = 30
    total_rounds: int = 3


class CreateRoomResponse(BaseModel):
    room_id: UUID
    code: str


class JoinRoomRequest(BaseModel):
    user_name: str


class JoinRoomResponse(BaseModel):
    participant_id: UUID
    draft_position: int


class RoomResponse(BaseModel):
    id: UUID
    name: str
    code: str
    status: str
    current_pick: int
    total_rounds: int
    turn_time_sec: int
    participants: List[dict]
    
    class Config:
        from_attributes = True


class StartDraftResponse(BaseModel):
    success: bool
    message: str


@router.post("", response_model=CreateRoomResponse)
async def create_room(
    request: CreateRoomRequest,
    db: AsyncSession = Depends(get_db)
) -> CreateRoomResponse:
    # Generate unique room code
    code = generate_room_code()
    while await get_room_by_code(db, code):
        code = generate_room_code()
    
    # Create room
    room = DraftRoom(
        name=request.name,
        code=code,
        turn_time_sec=request.turn_time_sec,
        total_rounds=request.total_rounds
    )
    db.add(room)
    await db.flush()
    
    # Create host participant using provided host_name
    host = Participant(
        room_id=room.id,
        user_name=request.host_name,
        draft_position=1,
        is_host=True
    )
    db.add(host)
    await db.commit()
    await db.refresh(room)
    
    return CreateRoomResponse(room_id=room.id, code=room.code)


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room_endpoint(
    room_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> RoomResponse:
    room = await get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    participants = await get_participants_by_room(db, room_id)
    participants_data = [
        {
            "id": str(p.id),
            "user_name": p.user_name,
            "draft_position": p.draft_position,
            "is_host": p.is_host
        }
        for p in participants
    ]
    
    return RoomResponse(
        id=room.id,
        name=room.name,
        code=room.code,
        status=room.status,
        current_pick=room.current_pick,
        total_rounds=room.total_rounds,
        turn_time_sec=room.turn_time_sec,
        participants=participants_data
    )


@router.get("/code/{code}")
async def get_room_by_code_endpoint(
    code: str,
    db: AsyncSession = Depends(get_db)
):
    room = await get_room_by_code(db, code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {"room_id": str(room.id)}


@router.post("/{room_id}/join", response_model=JoinRoomResponse)
async def join_room(
    room_id: UUID,
    request: JoinRoomRequest,
    db: AsyncSession = Depends(get_db)
) -> JoinRoomResponse:
    room = await get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if room.status != "waiting":
        raise HTTPException(status_code=400, detail="Draft has already started")
    
    # Check if user already exists
    existing = await get_participant(db, room_id, request.user_name)
    if existing:
        # User already exists - broadcast updated participant list anyway
        participants = await get_participants_by_room(db, room_id)
        participants_data = [
            {
                "id": str(p.id),
                "user_name": p.user_name,
                "draft_position": p.draft_position,
                "is_host": p.is_host
            }
            for p in participants
        ]
        
        # Broadcast user joined (they're connecting from another device)
        from websocket.manager import manager
        await manager.broadcast(str(room_id), {
            "event": "user_joined",
            "user": request.user_name,
            "participants": participants_data
        })
        
        return JoinRoomResponse(
            participant_id=existing.id,
            draft_position=existing.draft_position
        )
    
    # Get current participants to determine draft position
    participants = await get_participants_by_room(db, room_id)
    draft_position = len(participants) + 1
    
    # Create participant
    participant = Participant(
        room_id=room_id,
        user_name=request.user_name,
        draft_position=draft_position,
        is_host=False
    )
    db.add(participant)
    await db.commit()
    await db.refresh(participant)
    
    # Get updated participants list
    participants = await get_participants_by_room(db, room_id)
    participants_data = [
        {
            "id": str(p.id),
            "user_name": p.user_name,
            "draft_position": p.draft_position,
            "is_host": p.is_host
        }
        for p in participants
    ]
    
    # Broadcast user joined
    from websocket.manager import manager
    await manager.broadcast(str(room_id), {
        "event": "user_joined",
        "user": request.user_name,
        "participants": participants_data
    })
    
    return JoinRoomResponse(
        participant_id=participant.id,
        draft_position=participant.draft_position
    )


@router.post("/{room_id}/start", response_model=StartDraftResponse)
async def start_draft(
    room_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> StartDraftResponse:
    room = await get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if room.status != "waiting":
        raise HTTPException(status_code=400, detail="Draft has already started")
    
    participants = await get_participants_by_room(db, room_id)
    if len(participants) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 participants to start")
    
    room.status = "drafting"
    room.current_pick = 0  # First pick will be 1
    await db.commit()
    
    # Broadcast draft started via WebSocket
    from websocket.manager import manager
    from services.draft import get_current_drafter
    from services.timer import start_timer
    
    participants = await get_participants_by_room(db, room_id)
    num_participants = len(participants)
    current_drafter_position = get_current_drafter(1, num_participants)  # First pick is pick #1
    current_participant = next(
        (p for p in participants if p.draft_position == current_drafter_position),
        None
    )
    current_turn = current_participant.user_name if current_participant else None
    
    await manager.broadcast(str(room_id), {
        "event": "draft_started",
        "current_pick": 1,
        "current_turn": current_turn
    })
    
    # Start timer for first pick
    if current_turn:
        start_timer(room_id, 1, room.turn_time_sec)
    
    return StartDraftResponse(success=True, message="Draft started")

