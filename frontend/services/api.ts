import { config } from '../src/config';

const API_BASE_URL = config.API_URL;

export interface CreateRoomRequest {
  name: string;
  turn_time_sec?: number;
  total_rounds?: number;
}

export interface CreateRoomResponse {
  room_id: string;
  code: string;
}

export interface JoinRoomRequest {
  user_name: string;
}

export interface JoinRoomResponse {
  participant_id: string;
  draft_position: number;
}

export interface RoomResponse {
  id: string;
  name: string;
  code: string;
  status: string;
  current_pick: number;
  total_rounds: number;
  turn_time_sec: number;
  participants: Array<{
    id: string;
    user_name: string;
    draft_position: number;
    is_host: boolean;
  }>;
}

export interface PlayersListResponse {
  players: Array<{
    id: string;
    name: string;
    team: string;
    position: string;
    fantasy_pts: number;
    [key: string]: any;
  }>;
}

export interface PicksListResponse {
  picks: Array<{
    pick_number: number;
    user_name: string;
    player: any;
    picked_at: string;
  }>;
}

export interface TeamsResponse {
  teams: Record<string, any[]>;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Rooms
  async createRoom(data: CreateRoomRequest): Promise<CreateRoomResponse> {
    return this.request<CreateRoomResponse>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRoom(roomId: string): Promise<RoomResponse> {
    return this.request<RoomResponse>(`/api/rooms/${roomId}`);
  }

  async getRoomByCode(code: string): Promise<{ room_id: string }> {
    return this.request<{ room_id: string }>(`/api/rooms/code/${code}`);
  }

  async joinRoom(roomId: string, data: JoinRoomRequest): Promise<JoinRoomResponse> {
    return this.request<JoinRoomResponse>(`/api/rooms/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async startDraft(roomId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/rooms/${roomId}/start`, {
      method: 'POST',
    });
  }

  // Players
  async getPlayers(): Promise<PlayersListResponse> {
    return this.request<PlayersListResponse>('/api/players');
  }

  async getAvailablePlayers(roomId: string): Promise<PlayersListResponse> {
    return this.request<PlayersListResponse>(`/api/players/rooms/${roomId}/available`);
  }

  // Picks
  async getPicks(roomId: string): Promise<PicksListResponse> {
    return this.request<PicksListResponse>(`/api/rooms/${roomId}/picks`);
  }

  async getTeams(roomId: string): Promise<TeamsResponse> {
    return this.request<TeamsResponse>(`/api/rooms/${roomId}/teams`);
  }
}

export const apiService = new ApiService();

