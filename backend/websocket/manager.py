from typing import Dict, Set
from fastapi import WebSocket
import json
import asyncio


class ConnectionManager:
    def __init__(self):
        # room_id -> Set[WebSocket]
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # room_id -> user_name -> WebSocket
        self.user_connections: Dict[str, Dict[str, WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: str, user_name: str):
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = set()
            self.user_connections[room_id] = {}
        
        # Remove old connection if exists
        if user_name in self.user_connections[room_id]:
            old_ws = self.user_connections[room_id][user_name]
            self.active_connections[room_id].discard(old_ws)
            try:
                await old_ws.close()
            except:
                pass
        
        self.active_connections[room_id].add(websocket)
        self.user_connections[room_id][user_name] = websocket
    
    def disconnect(self, websocket: WebSocket, room_id: str, user_name: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].discard(websocket)
        
        if room_id in self.user_connections:
            if user_name in self.user_connections[room_id]:
                if self.user_connections[room_id][user_name] == websocket:
                    del self.user_connections[room_id][user_name]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            print(f"Error sending personal message: {e}")
    
    async def broadcast(self, room_id: str, message: dict):
        if room_id not in self.active_connections:
            return
        
        disconnected = set()
        for connection in self.active_connections[room_id]:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error broadcasting to connection: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.active_connections[room_id].discard(connection)
    
    async def send_to_user(self, room_id: str, user_name: str, message: dict):
        if room_id in self.user_connections:
            if user_name in self.user_connections[room_id]:
                try:
                    await self.user_connections[room_id][user_name].send_text(json.dumps(message))
                except Exception as e:
                    print(f"Error sending to user {user_name}: {e}")


manager = ConnectionManager()

