from typing import Dict, Set
from fastapi import WebSocket
import json
import asyncio


class ConnectionManager:
    def __init__(self):
        # room_id -> Set[WebSocket]
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # room_id -> user_name -> Set[WebSocket] (supports multiple connections per user)
        self.user_connections: Dict[str, Dict[str, Set[WebSocket]]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: str, user_name: str):
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = set()
            self.user_connections[room_id] = {}
        
        # Add connection to active connections
        self.active_connections[room_id].add(websocket)
        
        # Add to user's connection set (supports multiple devices)
        if user_name not in self.user_connections[room_id]:
            self.user_connections[room_id][user_name] = set()
        self.user_connections[room_id][user_name].add(websocket)
        
        print(f"[WS] {user_name} connected to room {room_id}")
        print(f"[WS] Room {room_id} now has {len(self.active_connections[room_id])} connection(s)")
        print(f"[WS] User {user_name} has {len(self.user_connections[room_id][user_name])} device(s) connected")
    
    def disconnect(self, websocket: WebSocket, room_id: str, user_name: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].discard(websocket)
        
        if room_id in self.user_connections:
            if user_name in self.user_connections[room_id]:
                self.user_connections[room_id][user_name].discard(websocket)
                # Clean up empty sets
                if len(self.user_connections[room_id][user_name]) == 0:
                    del self.user_connections[room_id][user_name]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            print(f"Error sending personal message: {e}")
    
    async def broadcast(self, room_id: str, message: dict):
        """Broadcast message to all connections in a room."""
        if room_id not in self.active_connections:
            print(f"[WS] Broadcast to room {room_id}: No active connections")
            return
        
        connection_count = len(self.active_connections[room_id])
        print(f"[WS] Broadcasting '{message.get('event', 'unknown')}' to room {room_id} ({connection_count} connection(s))")
        
        disconnected = set()
        for connection in self.active_connections[room_id]:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                print(f"[WS] Error broadcasting to connection: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.active_connections[room_id].discard(connection)
            # Also remove from user_connections
            for user_name, connections in self.user_connections.get(room_id, {}).items():
                connections.discard(connection)
        
        if disconnected:
            print(f"[WS] Cleaned up {len(disconnected)} disconnected connection(s)")
    
    async def send_to_user(self, room_id: str, user_name: str, message: dict):
        """Send message to all connections for a specific user (all their devices)."""
        if room_id in self.user_connections:
            if user_name in self.user_connections[room_id]:
                disconnected = set()
                for connection in self.user_connections[room_id][user_name]:
                    try:
                        await connection.send_text(json.dumps(message))
                    except Exception as e:
                        print(f"Error sending to user {user_name}: {e}")
                        disconnected.add(connection)
                
                # Clean up disconnected connections
                for connection in disconnected:
                    self.user_connections[room_id][user_name].discard(connection)
                    self.active_connections[room_id].discard(connection)
                
                # Clean up empty sets
                if len(self.user_connections[room_id][user_name]) == 0:
                    del self.user_connections[room_id][user_name]


manager = ConnectionManager()
