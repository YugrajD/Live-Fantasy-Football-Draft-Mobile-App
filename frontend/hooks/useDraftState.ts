import { useState, useEffect, useCallback } from 'react';
import { DraftState, DraftRoom, Pick, Player, WebSocketMessage } from '../types';
import { useWebSocket } from './useWebSocket';

interface UseDraftStateOptions {
  roomId: string;
  userName: string;
  initialRoom?: DraftRoom;
}

export const useDraftState = ({
  roomId,
  userName,
  initialRoom,
}: UseDraftStateOptions) => {
  const [state, setState] = useState<DraftState>({
    room: initialRoom || null,
    picks: [],
    availablePlayers: [],
    myTeam: [],
    currentTurn: null,
    timerSeconds: null,
    isMyTurn: false,
  });

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.event) {
      case 'sync':
        setState((prev) => ({
          ...prev,
          room: message.room,
          picks: message.picks || [],
          availablePlayers: message.available_players || [],
          myTeam: (message.picks || [])
            .filter((p: Pick) => p.user_name === userName)
            .map((p: Pick) => p.player),
        }));
        break;

      case 'user_joined':
      case 'user_left':
        if (message.participants) {
          console.log('User joined/left event:', message.user, 'Participants:', message.participants);
          setState((prev) => ({
            ...prev,
            room: prev.room
              ? { ...prev.room, participants: message.participants }
              : null,
          }));
        }
        break;

      case 'draft_started':
        setState((prev) => ({
          ...prev,
          room: prev.room ? { ...prev.room, status: 'drafting' } : null,
          currentTurn: message.current_turn || null,
          isMyTurn: message.current_turn === userName,
        }));
        break;

      case 'pick_made':
        const newPick: Pick = {
          pick_number: message.pick_number,
          user_name: message.user,
          player: message.player,
          picked_at: new Date().toISOString(),
        };

        setState((prev) => {
          const updatedPicks = [...prev.picks, newPick];
          const updatedAvailable = prev.availablePlayers.filter(
            (p) => p.id !== message.player.id
          );

          return {
            ...prev,
            picks: updatedPicks,
            availablePlayers: updatedAvailable,
            myTeam:
              message.user === userName
                ? [...prev.myTeam, message.player]
                : prev.myTeam,
            currentTurn: message.next_turn || null,
            isMyTurn: message.next_turn === userName,
            room: prev.room
              ? { ...prev.room, current_pick: message.pick_number }
              : prev.room,
          };
        });
        break;

      case 'timer_tick':
        setState((prev) => ({
          ...prev,
          timerSeconds: message.seconds_left,
        }));
        break;

      case 'draft_complete':
        setState((prev) => ({
          ...prev,
          room: prev.room ? { ...prev.room, status: 'completed' } : null,
          timerSeconds: null,
        }));
        break;

      case 'error':
        console.error('WebSocket error:', message.message);
        break;
    }
  }, [userName]);

  const { send, isConnected } = useWebSocket({
    roomId,
    userName,
    onMessage: handleMessage,
  });

  const makePick = useCallback(
    (playerId: string) => {
      send({ action: 'pick', player_id: playerId });
    },
    [send]
  );

  return {
    ...state,
    makePick,
    isConnected,
  };
};

