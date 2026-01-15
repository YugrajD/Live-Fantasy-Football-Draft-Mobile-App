export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  fantasy_pts: number;
  pass_yds?: number | null;
  pass_td?: number | null;
  rush_yds?: number | null;
  rush_td?: number | null;
  rec_yds?: number | null;
  rec_td?: number | null;
  fg_made?: number | null;
  xp_made?: number | null;
  sacks?: number | null;
  ints?: number | null;
  image_url?: string | null;
}

export interface Participant {
  id: string;
  user_name: string;
  draft_position: number;
  is_host: boolean;
}

export interface DraftRoom {
  id: string;
  name: string;
  code: string;
  status: 'waiting' | 'drafting' | 'completed';
  current_pick: number;
  total_rounds: number;
  turn_time_sec: number;
  participants: Participant[];
}

export interface Pick {
  pick_number: number;
  user_name: string;
  player: Player;
  picked_at: string;
}

export interface WebSocketMessage {
  event: string;
  [key: string]: any;
}

export interface DraftState {
  room: DraftRoom | null;
  picks: Pick[];
  availablePlayers: Player[];
  myTeam: Player[];
  currentTurn: string | null;
  timerSeconds: number | null;
  isMyTurn: boolean;
}

