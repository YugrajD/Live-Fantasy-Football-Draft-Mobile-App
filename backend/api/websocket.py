from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import json

from db.database import get_db
from db.queries import get_room, get_participant, get_participants_by_room
from websocket.manager import manager
from websocket.handlers import handle_pick, send_sync_message
from services.draft import get_current_drafter
from services.timer import start_timer

router = APIRouter()


@router.websocket("/ws/{room_id}/{user_name}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    user_name: str
):
    try:
        room_uuid = UUID(room_id)
    except ValueError:
        await websocket.close(code=1008, reason="Invalid room ID")
        return
    
    # Verify room and participant exist
    from db.database import async_session
    async with async_session() as db:
        room = await get_room(db, room_uuid)
        if not room:
            await websocket.close(code=1008, reason="Room not found")
            return
        
        participant = await get_participant(db, room_uuid, user_name)
        if not participant:
            await websocket.close(code=1008, reason="Participant not found")
            return
        
        # Connect
        await manager.connect(websocket, room_id, user_name)
        
        # Send sync message
        sync_msg = await send_sync_message(room_uuid, db)
        if sync_msg:
            await manager.send_personal_message(sync_msg, websocket)
        
        # Broadcast user joined
        participants = await get_participants_by_room(db, room_uuid)
        participants_data = [
            {
                "id": str(p.id),
                "user_name": p.user_name,
                "draft_position": p.draft_position,
                "is_host": p.is_host
            }
            for p in participants
        ]
        
        await manager.broadcast(room_id, {
            "event": "user_joined",
            "user": user_name,
            "participants": participants_data
        })
        
        # If draft is in progress, determine current turn
        if room.status == "drafting":
            num_participants = len(participants)
            current_drafter_position = get_current_drafter(room.current_pick + 1, num_participants)
            current_participant = next(
                (p for p in participants if p.draft_position == current_drafter_position),
                None
            )
            current_turn = current_participant.user_name if current_participant else None
            
            await manager.broadcast(room_id, {
                "event": "draft_started",
                "current_pick": room.current_pick + 1,
                "current_turn": current_turn
            })
            
            # Start timer if it's this user's turn
            if current_turn == user_name:
                start_timer(room_uuid, room.current_pick + 1, room.turn_time_sec)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("action") == "pick":
                player_id = message.get("player_id")
                if not player_id:
                    await manager.send_to_user(
                        room_id,
                        user_name,
                        {"event": "error", "message": "Missing player_id"}
                    )
                    continue
                
                # Handle pick in a new database session
                async with async_session() as db:
                    await handle_pick(room_uuid, user_name, player_id, db)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id, user_name)
        
        # Broadcast user left
        async with async_session() as db:
            participants = await get_participants_by_room(db, room_uuid)
            participants_data = [
                {
                    "id": str(p.id),
                    "user_name": p.user_name,
                    "draft_position": p.draft_position,
                    "is_host": p.is_host
                }
                for p in participants
            ]
            
            await manager.broadcast(room_id, {
                "event": "user_left",
                "user": user_name,
                "participants": participants_data
            })
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, room_id, user_name)

