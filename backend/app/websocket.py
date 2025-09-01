"""
WebSocket manager for real-time communication.
"""
import json
from typing import Dict, List, Set
from fastapi import WebSocket


class WebSocketManager:
    """Manages WebSocket connections for real-time game communication."""
    
    def __init__(self):
        # session_id -> {player_id -> websocket}
        self.connections: Dict[str, Dict[str, WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str, player_id: str):
        """Accept a WebSocket connection and add to session."""
        await websocket.accept()
        
        if session_id not in self.connections:
            self.connections[session_id] = {}
        
        self.connections[session_id][player_id] = websocket
        
        # Notify others in session about new connection
        await self.broadcast_to_session(session_id, {
            "type": "PLAYER_CONNECTED",
            "data": {"player_id": player_id}
        }, exclude_player=player_id)
    
    async def disconnect(self, websocket: WebSocket, session_id: str, player_id: str):
        """Remove WebSocket connection."""
        if session_id in self.connections and player_id in self.connections[session_id]:
            del self.connections[session_id][player_id]
            
            # Clean up empty sessions
            if not self.connections[session_id]:
                del self.connections[session_id]
            else:
                # Notify others about disconnection
                await self.broadcast_to_session(session_id, {
                    "type": "PLAYER_DISCONNECTED",
                    "data": {"player_id": player_id}
                }, exclude_player=player_id)
    
    async def send_to_player(self, session_id: str, player_id: str, message: dict):
        """Send message to a specific player."""
        if (session_id in self.connections and 
            player_id in self.connections[session_id]):
            websocket = self.connections[session_id][player_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending to player {player_id}: {e}")
                # Remove broken connection
                await self.disconnect(websocket, session_id, player_id)
    
    async def broadcast_to_session(self, session_id: str, message: dict, exclude_player: str = None):
        """Broadcast message to all players in a session."""
        if session_id not in self.connections:
            return
        
        disconnected_players = []
        
        for player_id, websocket in self.connections[session_id].items():
            if exclude_player and player_id == exclude_player:
                continue
            
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error broadcasting to player {player_id}: {e}")
                disconnected_players.append(player_id)
        
        # Clean up disconnected players
        for player_id in disconnected_players:
            if session_id in self.connections and player_id in self.connections[session_id]:
                websocket = self.connections[session_id][player_id]
                await self.disconnect(websocket, session_id, player_id)
    
    def get_connected_players(self, session_id: str) -> Set[str]:
        """Get list of connected player IDs for a session."""
        if session_id in self.connections:
            return set(self.connections[session_id].keys())
        return set()


# Global WebSocket manager instance
websocket_manager = WebSocketManager()