from typing import Dict, Optional, List, Set
from pydantic import BaseModel
from .game_state import GameState
import uuid
import random
import string

class Player(BaseModel):
    player_id: str
    pseudonym: str
    is_game_master: bool = False
    connected: bool = True

class Question(BaseModel):
    text: str
    correct_answer: str
    fake_answers: Dict[str, str] = {}  # player_id -> fake_answer
    votes: Dict[str, str] = {}  # player_id -> voted_answer
    source: str = "manual"  # "manual", "csv", "dice"
    original_text: Optional[str] = None  # Original question before editing
    original_answer: Optional[str] = None  # Original answer before editing
    
class GameSession(BaseModel):
    session_id: str
    game_master_id: str
    players: Dict[str, Player] = {}
    current_question: Optional[Question] = None
    game_state: GameState = GameState.WAITING_FOR_PLAYERS
    scores: Dict[str, int] = {}
    round_number: int = 0
    is_automatic_mode: bool = False
    question_set_id: Optional[str] = None
    used_questions: Set[int] = set()  # Track used question indices
    auto_timers: Dict[str, int] = {
        "submission_timeout": 60,
        "voting_timeout": 30,
        "results_display": 10
    }
    
    @classmethod
    def create_new(cls, game_master_pseudonym: str) -> "GameSession":
        """Create a new game session with a game master"""
        session_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        game_master_id = str(uuid.uuid4())
        
        game_master = Player(
            player_id=game_master_id,
            pseudonym=game_master_pseudonym,
            is_game_master=True
        )
        
        return cls(
            session_id=session_id,
            game_master_id=game_master_id,
            players={game_master_id: game_master},
            scores={game_master_id: 0}
        )
    
    def add_player(self, pseudonym: str) -> Player:
        """Add a new player to the session"""
        if self.is_pseudonym_taken(pseudonym):
            raise ValueError(f"Pseudonym '{pseudonym}' is already taken")
        
        player_id = str(uuid.uuid4())
        player = Player(
            player_id=player_id,
            pseudonym=pseudonym,
            is_game_master=False
        )
        
        self.players[player_id] = player
        self.scores[player_id] = 0
        return player
    
    def is_pseudonym_taken(self, pseudonym: str) -> bool:
        """Check if a pseudonym is already in use"""
        return any(player.pseudonym.lower() == pseudonym.lower() 
                  for player in self.players.values())
    
    def get_player(self, player_id: str) -> Optional[Player]:
        """Get a player by ID"""
        return self.players.get(player_id)
    
    def is_game_master(self, player_id: str) -> bool:
        """Check if a player is the game master"""
        return player_id == self.game_master_id
    
    def start_question_phase(self, question_text: str, correct_answer: str, source: str = "manual", 
                           original_text: Optional[str] = None, original_answer: Optional[str] = None):
        """Start a new question phase"""
        self.current_question = Question(
            text=question_text,
            correct_answer=correct_answer,
            source=source,
            original_text=original_text,
            original_answer=original_answer
        )
        self.game_state = GameState.SUBMISSION_PHASE
        self.round_number += 1
    
    def enable_automatic_mode(self, question_set_id: str, timers: Optional[Dict[str, int]] = None):
        """Enable automatic game master mode"""
        self.is_automatic_mode = True
        self.question_set_id = question_set_id
        if timers:
            self.auto_timers.update(timers)
    
    def add_used_question(self, question_index: int):
        """Mark a question as used"""
        self.used_questions.add(question_index)
    
    def submit_fake_answer(self, player_id: str, fake_answer: str):
        """Submit a fake answer for the current question"""
        if not self.current_question:
            raise ValueError("No active question")
        
        if self.game_state != GameState.SUBMISSION_PHASE:
            raise ValueError("Not in submission phase")
        
        if player_id == self.game_master_id:
            raise ValueError("Game master cannot submit fake answers")
        
        self.current_question.fake_answers[player_id] = fake_answer
    
    def get_all_answers_shuffled(self) -> List[str]:
        """Get all answers (fake + correct) in random order"""
        if not self.current_question:
            return []
        
        answers = list(self.current_question.fake_answers.values())
        answers.append(self.current_question.correct_answer)
        random.shuffle(answers)
        return answers
    
    def submit_vote(self, player_id: str, voted_answer: str):
        """Submit a vote for an answer"""
        if not self.current_question:
            raise ValueError("No active question")
        
        if self.game_state != GameState.VOTING_PHASE:
            raise ValueError("Not in voting phase")
        
        self.current_question.votes[player_id] = voted_answer
    
    def calculate_scores(self) -> Dict[str, int]:
        """Calculate and update scores based on votes"""
        if not self.current_question:
            return {}
        
        # Count votes for each answer
        vote_counts = {}
        for voted_answer in self.current_question.votes.values():
            vote_counts[voted_answer] = vote_counts.get(voted_answer, 0) + 1
        
        round_scores = {}
        
        # Award points to players whose fake answers got votes
        for player_id, fake_answer in self.current_question.fake_answers.items():
            votes_received = vote_counts.get(fake_answer, 0)
            self.scores[player_id] += votes_received
            round_scores[player_id] = votes_received
        
        # Award points to players who voted for the correct answer
        for player_id, voted_answer in self.current_question.votes.items():
            if voted_answer == self.current_question.correct_answer:
                # Give 1 point for voting correctly
                self.scores[player_id] += 1
                round_scores[player_id] = round_scores.get(player_id, 0) + 1
        
        return round_scores
    
    def get_results(self) -> Dict:
        """Get results for the current question"""
        if not self.current_question:
            return {}
        
        vote_counts = {}
        for voted_answer in self.current_question.votes.values():
            vote_counts[voted_answer] = vote_counts.get(voted_answer, 0) + 1
        
        return {
            "question": self.current_question.text,
            "correct_answer": self.current_question.correct_answer,
            "vote_counts": vote_counts,
            "fake_answers": {
                self.players[pid].pseudonym: answer 
                for pid, answer in self.current_question.fake_answers.items()
            },
            "scores": self.scores.copy()
        }
    
    def reset_for_next_round(self):
        """Reset session state for the next round"""
        self.current_question = None
        self.game_state = GameState.WAITING_FOR_PLAYERS