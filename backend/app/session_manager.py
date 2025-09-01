"""
Session manager for handling game sessions and player management.
"""
from typing import Dict, Optional, Tuple
from .models.session import GameSession, Player
from .services.auto_gm import auto_gm


class SessionManager:
    """Manages game sessions and player interactions."""
    
    def __init__(self):
        self.sessions: Dict[str, GameSession] = {}
    
    def create_session(self, game_master_pseudonym: str) -> GameSession:
        """Create a new game session with a game master."""
        session = GameSession.create_new(game_master_pseudonym)
        self.sessions[session.session_id] = session
        
        # Register with auto GM for potential automatic mode
        auto_gm.register_session(session)
        
        return session
    
    def get_session(self, session_id: str) -> Optional[GameSession]:
        """Get a session by ID."""
        return self.sessions.get(session_id)
    
    def join_session(self, session_id: str, pseudonym: str) -> Tuple[GameSession, Player]:
        """Add a player to an existing session."""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        player = session.add_player(pseudonym)
        return session, player
    
    def remove_session(self, session_id: str) -> bool:
        """Remove a session."""
        if session_id in self.sessions:
            # Unregister from auto GM
            auto_gm.unregister_session(session_id)
            del self.sessions[session_id]
            return True
        return False
    
    def get_all_sessions(self) -> Dict[str, GameSession]:
        """Get all active sessions."""
        return self.sessions.copy()


# Global session manager instance
session_manager = SessionManager()