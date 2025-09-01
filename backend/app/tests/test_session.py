import pytest
from app.models.session import GameSession, Player
from app.models.game_state import GameState

def test_create_new_session():
    """Test creating a new game session"""
    session = GameSession.create_new("TestMaster")
    
    assert session.session_id is not None
    assert len(session.session_id) == 6
    assert session.game_master_id is not None
    assert len(session.players) == 1
    assert session.game_state == GameState.WAITING_FOR_PLAYERS
    assert session.round_number == 0

def test_add_player():
    """Test adding a player to session"""
    session = GameSession.create_new("TestMaster")
    player = session.add_player("TestPlayer")
    
    assert player.pseudonym == "TestPlayer"
    assert not player.is_game_master
    assert len(session.players) == 2
    assert player.player_id in session.scores

def test_duplicate_pseudonym():
    """Test that duplicate pseudonyms are rejected"""
    session = GameSession.create_new("TestMaster")
    session.add_player("TestPlayer")
    
    with pytest.raises(ValueError, match="already taken"):
        session.add_player("TestPlayer")

def test_start_question_phase():
    """Test starting a question phase"""
    session = GameSession.create_new("TestMaster")
    session.start_question_phase("Test question?", "Test answer")
    
    assert session.current_question is not None
    assert session.current_question.text == "Test question?"
    assert session.current_question.correct_answer == "Test answer"
    assert session.game_state == GameState.SUBMISSION_PHASE
    assert session.round_number == 1

def test_submit_fake_answer():
    """Test submitting fake answers"""
    session = GameSession.create_new("TestMaster")
    player = session.add_player("TestPlayer")
    session.start_question_phase("Test question?", "Test answer")
    
    session.submit_fake_answer(player.player_id, "Fake answer")
    
    assert player.player_id in session.current_question.fake_answers
    assert session.current_question.fake_answers[player.player_id] == "Fake answer"

def test_game_master_cannot_submit_fake_answer():
    """Test that game master cannot submit fake answers"""
    session = GameSession.create_new("TestMaster")
    session.start_question_phase("Test question?", "Test answer")
    
    with pytest.raises(ValueError, match="Game master cannot submit"):
        session.submit_fake_answer(session.game_master_id, "Fake answer")

def test_voting_and_scoring():
    """Test voting and score calculation"""
    session = GameSession.create_new("TestMaster")
    player1 = session.add_player("Player1")
    player2 = session.add_player("Player2")
    
    session.start_question_phase("Test question?", "Correct answer")
    session.submit_fake_answer(player1.player_id, "Fake answer 1")
    session.submit_fake_answer(player2.player_id, "Fake answer 2")
    
    session.game_state = GameState.VOTING_PHASE
    
    # Both players vote for player1's fake answer
    session.submit_vote(player1.player_id, "Fake answer 1")
    session.submit_vote(player2.player_id, "Fake answer 1")
    session.submit_vote(session.game_master_id, "Fake answer 1")
    
    scores = session.calculate_scores()
    
    assert scores[player1.player_id] == 3  # Got 3 votes
    assert scores[player2.player_id] == 0  # Got 0 votes
    assert session.scores[player1.player_id] == 3