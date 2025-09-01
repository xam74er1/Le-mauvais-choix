"""
Automatic Game Master service for managing automated trivia sessions.
"""
import asyncio
from typing import Dict, Optional
from ..models.session import GameSession
from ..models.game_state import GameState
from ..models.questions import question_manager


class AutoGameMaster:
    """Manages automatic game master functionality."""
    
    def __init__(self):
        self.active_timers: Dict[str, asyncio.Task] = {}
        self.sessions: Dict[str, GameSession] = {}
    
    def register_session(self, session: GameSession):
        """Register a session for automatic management."""
        self.sessions[session.session_id] = session
    
    def unregister_session(self, session_id: str):
        """Unregister a session and cancel any active timers."""
        if session_id in self.active_timers:
            self.active_timers[session_id].cancel()
            del self.active_timers[session_id]
        
        if session_id in self.sessions:
            del self.sessions[session_id]
    
    async def start_automatic_session(self, session_id: str, question_set_id: str, 
                                    websocket_manager, timers: Optional[Dict[str, int]] = None):
        """Start automatic mode for a session."""
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        # Enable automatic mode
        session.enable_automatic_mode(question_set_id, timers)
        
        # Start the first question automatically
        await self.progress_to_next_question(session_id, websocket_manager)
    
    async def progress_to_next_question(self, session_id: str, websocket_manager):
        """Progress to the next question in automatic mode."""
        session = self.sessions.get(session_id)
        if not session or not session.is_automatic_mode:
            return
        
        try:
            # Get random question from the question set
            question_data, question_index = question_manager.get_random_question(
                session.question_set_id, session.used_questions
            )
            
            # Mark question as used
            session.add_used_question(question_index)
            
            # Start the question phase
            session.start_question_phase(
                question_data.question,
                question_data.answer,
                source="csv"
            )
            
            # Broadcast question to all players
            await websocket_manager.broadcast_to_session(session_id, {
                "type": "GAME_STATE_UPDATE",
                "data": {
                    "game_state": session.game_state.value,
                    "question": session.current_question.text,
                    "round_number": session.round_number,
                    "is_automatic_mode": True,
                    "question_source": "csv"
                }
            })
            
            # Start submission timer
            await self._start_phase_timer(session_id, "submission", websocket_manager)
            
        except Exception as e:
            print(f"Error in automatic progression: {e}")
            # Fallback to manual mode
            session.is_automatic_mode = False
    
    async def handle_phase_timeout(self, session_id: str, phase: str, websocket_manager):
        """Handle timeout for a specific phase."""
        session = self.sessions.get(session_id)
        if not session or not session.is_automatic_mode:
            return
        
        if phase == "submission":
            # Move to voting phase
            session.game_state = GameState.VOTING_PHASE
            answers = session.get_all_answers_shuffled()
            
            await websocket_manager.broadcast_to_session(session_id, {
                "type": "GAME_STATE_UPDATE",
                "data": {
                    "game_state": session.game_state.value,
                    "answers": answers,
                    "is_automatic_mode": True
                }
            })
            
            # Start voting timer
            await self._start_phase_timer(session_id, "voting", websocket_manager)
            
        elif phase == "voting":
            # Move to results phase
            await self.calculate_and_broadcast_results(session_id, websocket_manager)
            
            # Start results display timer
            await self._start_phase_timer(session_id, "results", websocket_manager)
            
        elif phase == "results":
            # Progress to next question
            session.reset_for_next_round()
            await self.progress_to_next_question(session_id, websocket_manager)
    
    async def calculate_and_broadcast_results(self, session_id: str, websocket_manager):
        """Calculate scores and broadcast results."""
        session = self.sessions.get(session_id)
        if not session:
            return
        
        # Calculate scores
        round_scores = session.calculate_scores()
        results = session.get_results()
        
        # Update game state
        session.game_state = GameState.RESULTS_PHASE
        
        # Broadcast results
        await websocket_manager.broadcast_to_session(session_id, {
            "type": "GAME_STATE_UPDATE",
            "data": {
                "game_state": session.game_state.value,
                "results": results,
                "round_scores": round_scores,
                "is_automatic_mode": True
            }
        })
    
    async def _start_phase_timer(self, session_id: str, phase: str, websocket_manager):
        """Start a timer for a specific phase."""
        session = self.sessions.get(session_id)
        if not session:
            return
        
        # Cancel existing timer
        if session_id in self.active_timers:
            self.active_timers[session_id].cancel()
        
        # Get timeout duration
        timeout_key = f"{phase}_timeout" if phase != "results" else "results_display"
        timeout = session.auto_timers.get(timeout_key, 30)
        
        # Start new timer
        self.active_timers[session_id] = asyncio.create_task(
            self._timer_countdown(session_id, phase, timeout, websocket_manager)
        )
    
    async def _timer_countdown(self, session_id: str, phase: str, duration: int, websocket_manager):
        """Countdown timer with progress updates."""
        try:
            for remaining in range(duration, 0, -1):
                await websocket_manager.broadcast_to_session(session_id, {
                    "type": "AUTO_MODE_PROGRESS",
                    "data": {
                        "current_phase": phase.upper() + "_PHASE",
                        "time_remaining": remaining,
                        "total_time": duration
                    }
                })
                await asyncio.sleep(1)
            
            # Timer expired, handle phase timeout
            await self.handle_phase_timeout(session_id, phase, websocket_manager)
            
        except asyncio.CancelledError:
            # Timer was cancelled (manual intervention)
            pass
        finally:
            # Clean up timer reference
            if session_id in self.active_timers:
                del self.active_timers[session_id]
    
    def cancel_timer(self, session_id: str):
        """Cancel active timer for manual intervention."""
        if session_id in self.active_timers:
            self.active_timers[session_id].cancel()
            del self.active_timers[session_id]


# Global auto game master instance
auto_gm = AutoGameMaster()