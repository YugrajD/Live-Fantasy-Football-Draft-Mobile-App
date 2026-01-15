from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from db.queries import (
    get_room, get_participant, get_participants_by_room,
    get_player, is_player_drafted, get_available_players, get_picks_by_room
)
from db.models import Pick
from services.draft import validate_pick, get_current_drafter
from services.timer import cancel_timer, start_timer
from websocket.manager import manager
from api.players import PlayerResponse


async def handle_pick(
    room_id: UUID,
    user_name: str,
    player_id_str: str,
    db: AsyncSession
):
    """Handle a pick action from a user."""
    try:
        player_id = UUID(player_id_str)
    except ValueError:
        await manager.send_to_user(
            str(room_id),
            user_name,
            {"event": "error", "message": "Invalid player ID"}
        )
        return
    
    room = await get_room(db, room_id)
    if not room:
        await manager.send_to_user(
            str(room_id),
            user_name,
            {"event": "error", "message": "Room not found"}
        )
        return
    
    participant = await get_participant(db, room_id, user_name)
    if not participant:
        await manager.send_to_user(
            str(room_id),
            user_name,
            {"event": "error", "message": "Participant not found"}
        )
        return
    
    player = await get_player(db, player_id)
    if not player:
        await manager.send_to_user(
            str(room_id),
            user_name,
            {"event": "error", "message": "Player not found"}
        )
        return
    
    participants = await get_participants_by_room(db, room_id)
    num_participants = len(participants)
    
    # Validate pick
    async def check_drafted(rid, pid):
        return await is_player_drafted(db, rid, pid)
    
    is_valid, error_msg = await validate_pick(
        room,
        participant,
        player_id,
        check_drafted,
        num_participants
    )
    
    if not is_valid:
        await manager.send_to_user(
            str(room_id),
            user_name,
            {"event": "error", "message": error_msg}
        )
        return
    
    # Cancel existing timer
    cancel_timer(room_id)
    
    # Create pick
    pick_number = room.current_pick + 1
    pick = Pick(
        room_id=room_id,
        participant_id=participant.id,
        player_id=player_id,
        pick_number=pick_number
    )
    db.add(pick)
    
    # Update room
    room.current_pick = pick_number
    
    # Check if draft is complete
    total_picks = room.total_rounds * num_participants
    if pick_number >= total_picks:
        room.status = "completed"
        await db.commit()
        
        # Broadcast draft complete
        from db.queries import get_teams_by_room
        teams = await get_teams_by_room(db, room_id)
        teams_data = {
            user_name: [PlayerResponse.model_validate(p).model_dump(mode='json') for p in players]
            for user_name, players in teams.items()
        }
        
        await manager.broadcast(str(room_id), {
            "event": "draft_complete",
            "teams": teams_data
        })
        
        # Send to SQS queue
        from services.queue import send_draft_complete_event
        await send_draft_complete_event(str(room_id))
        
        return
    
    await db.commit()
    
    # Determine next turn
    next_pick_number = pick_number + 1
    next_drafter_position = get_current_drafter(next_pick_number, num_participants)
    next_participant = next(
        (p for p in participants if p.draft_position == next_drafter_position),
        None
    )
    next_turn = next_participant.user_name if next_participant else None
    
    # Broadcast pick made
    await manager.broadcast(str(room_id), {
        "event": "pick_made",
        "user": user_name,
        "player": PlayerResponse.model_validate(player).model_dump(mode='json'),
        "pick_number": pick_number,
        "next_turn": next_turn
    })
    
    # Start timer for next pick
    if next_turn:
        start_timer(room_id, next_pick_number, room.turn_time_sec)


async def send_sync_message(room_id: UUID, db: AsyncSession):
    """Send full sync message to a user when they connect."""
    room = await get_room(db, room_id)
    if not room:
        return None
    
    participants = await get_participants_by_room(db, room_id)
    picks = await get_picks_by_room(db, room_id)
    available = await get_available_players(db, room_id)
    
    participants_data = [
        {
            "id": str(p.id),
            "user_name": p.user_name,
            "draft_position": p.draft_position,
            "is_host": p.is_host
        }
        for p in participants
    ]
    
    picks_data = [
        {
            "pick_number": p.pick_number,
            "user_name": p.participant.user_name,
            "player": PlayerResponse.model_validate(p.player).model_dump(mode='json'),
            "picked_at": p.picked_at.isoformat()
        }
        for p in picks
    ]
    
    available_data = [PlayerResponse.model_validate(p).model_dump(mode='json') for p in available]
    
    room_data = {
        "id": str(room.id),
        "name": room.name,
        "code": room.code,
        "status": room.status,
        "current_pick": room.current_pick,
        "total_rounds": room.total_rounds,
        "turn_time_sec": room.turn_time_sec
    }
    
    return {
        "event": "sync",
        "room": room_data,
        "participants": participants_data,
        "picks": picks_data,
        "available_players": available_data
    }

