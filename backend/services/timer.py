import asyncio
from typing import Dict, Optional
from uuid import UUID
from websocket.manager import manager
from db.queries import get_room, get_available_players
from db.database import async_session
from services.draft import get_current_drafter


# Track active timers: room_id -> asyncio.Task
active_timers: Dict[str, asyncio.Task] = {}


async def run_pick_timer(room_id: UUID, pick_number: int, seconds: int):
    """
    Countdown timer for current pick.
    Auto-picks if timer expires.
    """
    room_id_str = str(room_id)
    
    # Cancel existing timer for this room
    if room_id_str in active_timers:
        active_timers[room_id_str].cancel()
    
    for remaining in range(seconds, 0, -1):
        # Check if pick was already made
        async with async_session() as db:
            room = await get_room(db, room_id)
            if not room or room.current_pick != pick_number:
                if room_id_str in active_timers:
                    del active_timers[room_id_str]
                return  # Pick was made, stop timer
        
        await manager.broadcast(room_id_str, {
            "event": "timer_tick",
            "seconds_left": remaining
        })
        await asyncio.sleep(1)
    
    # Timer expired - auto pick best available
    if room_id_str in active_timers:
        del active_timers[room_id_str]
    
    await auto_pick(room_id)


async def auto_pick(room_id: UUID):
    """
    Auto-pick the highest rated available player for the current drafter.
    """
    from websocket.handlers import handle_pick
    
    async with async_session() as db:
        room = await get_room(db, room_id)
        if not room or room.status != "drafting":
            return
        
        from db.queries import get_participants_by_room, get_available_players
        participants = await get_participants_by_room(db, room_id)
        num_participants = len(participants)
        
        current_drafter_position = get_current_drafter(room.current_pick + 1, num_participants)
        current_participant = next(
            (p for p in participants if p.draft_position == current_drafter_position),
            None
        )
        
        if not current_participant:
            return
        
        # Get best available player
        available = await get_available_players(db, room_id)
        if not available:
            return
        
        best_player = available[0]  # Already sorted by fantasy_pts desc
        
        # Use the pick handler with current session
        await handle_pick(
            room_id,
            current_participant.user_name,
            str(best_player.id),
            db
        )


def cancel_timer(room_id: UUID):
    """Cancel the active timer for a room."""
    room_id_str = str(room_id)
    if room_id_str in active_timers:
        active_timers[room_id_str].cancel()
        del active_timers[room_id_str]


def start_timer(room_id: UUID, pick_number: int, seconds: int):
    """Start a new timer for a room."""
    room_id_str = str(room_id)
    task = asyncio.create_task(run_pick_timer(room_id, pick_number, seconds))
    active_timers[room_id_str] = task

