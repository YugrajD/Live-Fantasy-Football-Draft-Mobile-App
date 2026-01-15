from typing import Tuple


def get_current_drafter(pick_number: int, num_participants: int) -> int:
    """
    Snake draft: 1,2,3,4,4,3,2,1,1,2,3,4...
    Returns draft_position (1-indexed)
    """
    if pick_number == 0:
        return 0
    
    round_num = (pick_number - 1) // num_participants
    position_in_round = (pick_number - 1) % num_participants
    
    if round_num % 2 == 0:
        # Odd rounds: 1 -> N
        return position_in_round + 1
    else:
        # Even rounds: N -> 1
        return num_participants - position_in_round


async def validate_pick(
    room,
    participant,
    player_id,
    is_player_drafted_func,
    num_participants: int
) -> Tuple[bool, str]:
    """
    Returns (is_valid, error_message)
    """
    # Check room is drafting
    if room.status != "drafting":
        return False, "Draft has not started"
    
    # Check it's user's turn
    current_drafter_position = get_current_drafter(room.current_pick + 1, num_participants)
    if participant.draft_position != current_drafter_position:
        return False, "Not your turn"
    
    # Check player is available
    if await is_player_drafted_func(room.id, player_id):
        return False, "Player already drafted"
    
    return True, ""

