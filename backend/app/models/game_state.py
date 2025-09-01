"""
Game state enumeration for managing game flow.
"""
from enum import Enum


class GameState(Enum):
    """Possible states of a game session."""
    WAITING_FOR_PLAYERS = "waiting_for_players"
    QUESTION_PHASE = "question_phase"
    SUBMISSION_PHASE = "submission_phase"
    VOTING_PHASE = "voting_phase"
    RESULTS_PHASE = "results_phase"
    GAME_ENDED = "game_ended"
    AUTO_MODE_SETUP = "auto_mode_setup"  # New state for automatic mode configuration