from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from .session_manager import session_manager
from .models.game_state import GameState
from .models.questions import question_manager, QuestionSet
from .services.auto_gm import auto_gm
from .websocket import WebSocketManager

app = FastAPI(title="Multiplayer Trivia Game API")

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket manager
websocket_manager = WebSocketManager()

# Request/Response models
class CreateSessionRequest(BaseModel):
    game_master_pseudonym: str

class CreateSessionResponse(BaseModel):
    session_id: str
    player_id: str

class JoinSessionRequest(BaseModel):
    pseudonym: str

class JoinSessionResponse(BaseModel):
    player_id: str
    session_state: Dict

class SubmitQuestionRequest(BaseModel):
    question: str
    answer: str

class SubmitAnswerRequest(BaseModel):
    fake_answer: str

class SubmitVoteRequest(BaseModel):
    voted_answer: str

class EnableAutoModeRequest(BaseModel):
    question_set_id: str
    timers: Optional[Dict[str, int]] = None

class EditQuestionRequest(BaseModel):
    question: str
    answer: str

# API Endpoints

@app.post("/sessions", response_model=CreateSessionResponse)
async def create_session(request: CreateSessionRequest):
    """Create a new game session"""
    try:
        session = session_manager.create_session(request.game_master_pseudonym)
        return CreateSessionResponse(
            session_id=session.session_id,
            player_id=session.game_master_id
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/sessions/{session_id}/join", response_model=JoinSessionResponse)
async def join_session(session_id: str, request: JoinSessionRequest):
    """Join an existing session"""
    try:
        session, player = session_manager.join_session(session_id, request.pseudonym)
        
        # Notify other players via WebSocket
        await websocket_manager.broadcast_to_session(session_id, {
            "type": "PLAYER_JOINED",
            "data": {
                "player": {
                    "player_id": player.player_id,
                    "pseudonym": player.pseudonym,
                    "is_game_master": player.is_game_master
                },
                "total_players": len(session.players)
            }
        })
        
        return JoinSessionResponse(
            player_id=player.player_id,
            session_state={
                "session_id": session.session_id,
                "game_state": session.game_state,
                "players": [
                    {
                        "player_id": p.player_id,
                        "pseudonym": p.pseudonym,
                        "is_game_master": p.is_game_master
                    }
                    for p in session.players.values()
                ],
                "scores": session.scores,
                "round_number": session.round_number
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{session_id}/state")
async def get_session_state(session_id: str):
    """Get current session state"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    response = {
        "session_id": session.session_id,
        "game_state": session.game_state,
        "players": [
            {
                "player_id": p.player_id,
                "pseudonym": p.pseudonym,
                "is_game_master": p.is_game_master,
                "connected": p.connected
            }
            for p in session.players.values()
        ],
        "scores": session.scores,
        "round_number": session.round_number
    }
    
    # Add question info if in appropriate phase
    if session.current_question and session.game_state in [
        GameState.SUBMISSION_PHASE, 
        GameState.VOTING_PHASE, 
        GameState.RESULTS_PHASE
    ]:
        response["current_question"] = {
            "text": session.current_question.text,
            "submissions_count": len(session.current_question.fake_answers),
            "votes_count": len(session.current_question.votes)
        }
        
        if session.game_state == GameState.VOTING_PHASE:
            response["answers"] = session.get_all_answers_shuffled()
        elif session.game_state == GameState.RESULTS_PHASE:
            response["results"] = session.get_results()
    
    return response

@app.post("/sessions/{session_id}/questions")
async def submit_question(session_id: str, player_id: str, request: SubmitQuestionRequest):
    """Submit a question (game master only)"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.is_game_master(player_id):
        raise HTTPException(status_code=403, detail="Only game master can submit questions")
    
    try:
        session.start_question_phase(request.question, request.answer)
        
        # Broadcast question to all players
        message = {
            "type": "QUESTION_SUBMITTED",
            "data": {
                "question": request.question,
                "game_state": session.game_state.value,  # Convert enum to string
                "round_number": session.round_number
            }
        }
        print(f"Broadcasting message: {message}")  # Debug log
        await websocket_manager.broadcast_to_session(session_id, message)
        
        return {"message": "Question submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/sessions/{session_id}/answers")
async def submit_answer(session_id: str, player_id: str, request: SubmitAnswerRequest):
    """Submit a fake answer"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        session.submit_fake_answer(player_id, request.fake_answer)
        
        # Check if all players have submitted
        non_gm_players = [p for p in session.players.values() if not p.is_game_master]
        # Ensure we have at least 1 non-GM player and all have submitted
        all_submitted = len(non_gm_players) > 0 and len(session.current_question.fake_answers) == len(non_gm_players)
        
        # Broadcast submission update
        await websocket_manager.broadcast_to_session(session_id, {
            "type": "ANSWER_SUBMITTED",
            "data": {
                "submissions_count": len(session.current_question.fake_answers),
                "total_expected": len(non_gm_players),
                "all_submitted": all_submitted
            }
        })
        
        # If all submitted, move to voting phase
        if all_submitted:
            session.game_state = GameState.VOTING_PHASE
            await websocket_manager.broadcast_to_session(session_id, {
                "type": "VOTING_PHASE_STARTED",
                "data": {
                    "game_state": session.game_state.value,  # Convert enum to string
                    "answers": session.get_all_answers_shuffled()
                }
            })
        
        return {"message": "Answer submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/sessions/{session_id}/votes")
async def submit_vote(session_id: str, player_id: str, request: SubmitVoteRequest):
    """Submit a vote"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        session.submit_vote(player_id, request.voted_answer)
        
        # Check if all non-game-master players have voted
        non_gm_players = [p for p in session.players.values() if not p.is_game_master]
        # Ensure we have at least 1 non-GM player and all have voted
        all_voted = len(non_gm_players) > 0 and len(session.current_question.votes) == len(non_gm_players)
        
        # Broadcast vote update
        await websocket_manager.broadcast_to_session(session_id, {
            "type": "VOTE_SUBMITTED",
            "data": {
                "votes_count": len(session.current_question.votes),
                "total_players": len(non_gm_players),
                "all_voted": all_voted
            }
        })
        
        # If all voted, show results
        if all_voted:
            session.game_state = GameState.RESULTS_PHASE
            round_scores = session.calculate_scores()
            results = session.get_results()
            
            await websocket_manager.broadcast_to_session(session_id, {
                "type": "RESULTS_READY",
                "data": {
                    "game_state": session.game_state.value,  # Convert enum to string
                    "results": results,
                    "round_scores": round_scores
                }
            })
        
        return {"message": "Vote submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/sessions/{session_id}/end-submissions")
async def end_submissions(session_id: str, player_id: str):
    """End submission phase early and start voting (game master only)"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.is_game_master(player_id):
        raise HTTPException(status_code=403, detail="Only game master can end submissions")
    
    if session.game_state != GameState.SUBMISSION_PHASE:
        raise HTTPException(status_code=400, detail="Not in submission phase")
    
    try:
        # Force end submissions and start voting
        session.game_state = GameState.VOTING_PHASE
        
        await websocket_manager.broadcast_to_session(session_id, {
            "type": "SUBMISSIONS_ENDED_EARLY",
            "data": {
                "game_state": session.game_state.value,  # Convert enum to string
                "answers": session.get_all_answers_shuffled(),
                "message": "Game master ended submission phase early"
            }
        })
        
        return {"message": "Submissions ended successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/sessions/{session_id}/end-voting")
async def end_voting(session_id: str, player_id: str):
    """End voting phase early (game master only)"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.is_game_master(player_id):
        raise HTTPException(status_code=403, detail="Only game master can end voting")
    
    if session.game_state != GameState.VOTING_PHASE:
        raise HTTPException(status_code=400, detail="Not in voting phase")
    
    try:
        # Force end voting and show results
        session.game_state = GameState.RESULTS_PHASE
        round_scores = session.calculate_scores()
        results = session.get_results()
        
        await websocket_manager.broadcast_to_session(session_id, {
            "type": "VOTING_ENDED_EARLY",
            "data": {
                "game_state": session.game_state.value,  # Convert enum to string
                "results": results,
                "round_scores": round_scores,
                "message": "Game master ended voting early"
            }
        })
        
        return {"message": "Voting ended successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/sessions/{session_id}/next-round")
async def start_next_round(session_id: str, player_id: str):
    """Start next round (game master only)"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.is_game_master(player_id):
        raise HTTPException(status_code=403, detail="Only game master can start next round")
    
    session.reset_for_next_round()
    
    await websocket_manager.broadcast_to_session(session_id, {
        "type": "NEXT_ROUND_STARTED",
        "data": {
            "game_state": session.game_state.value,  # Convert enum to string
            "round_number": session.round_number
        }
    })
    
    return {"message": "Next round started"}

# CSV Question Management Endpoints

@app.post("/question-sets/upload")
async def upload_question_set(file: UploadFile = File(...)):
    """Upload a CSV question file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        content = await file.read()
        file_content = content.decode('utf-8')
        
        question_set = question_manager.parse_csv(file_content, file.filename)
        
        return {
            "message": "Question set uploaded successfully",
            "question_set": {
                "set_id": question_set.set_id,
                "name": question_set.name,
                "category": question_set.category,
                "question_count": len(question_set.questions),
                "created_at": question_set.created_at
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@app.get("/question-sets")
async def list_question_sets():
    """List all available question sets"""
    question_sets = question_manager.list_question_sets()
    return {
        "question_sets": [
            {
                "set_id": qs.set_id,
                "name": qs.name,
                "category": qs.category,
                "question_count": len(qs.questions),
                "created_at": qs.created_at
            }
            for qs in question_sets
        ]
    }

@app.get("/question-sets/{set_id}")
async def get_question_set(set_id: str):
    """Get details of a specific question set"""
    question_set = question_manager.get_question_set(set_id)
    if not question_set:
        raise HTTPException(status_code=404, detail="Question set not found")
    
    return {
        "set_id": question_set.set_id,
        "name": question_set.name,
        "category": question_set.category,
        "questions": [
            {
                "question": q.question,
                "answer": q.answer,
                "category": q.category,
                "difficulty": q.difficulty
            }
            for q in question_set.questions[:10]  # Preview first 10 questions
        ],
        "total_questions": len(question_set.questions),
        "created_at": question_set.created_at
    }

@app.delete("/question-sets/{set_id}")
async def delete_question_set(set_id: str):
    """Delete a question set"""
    success = question_manager.delete_question_set(set_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question set not found")
    
    return {"message": "Question set deleted successfully"}

# Automatic Mode Endpoints

@app.post("/sessions/{session_id}/auto-mode")
async def enable_auto_mode(session_id: str, player_id: str, request: EnableAutoModeRequest):
    """Enable automatic game master mode"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.is_game_master(player_id):
        raise HTTPException(status_code=403, detail="Only game master can enable auto mode")
    
    # Verify question set exists
    question_set = question_manager.get_question_set(request.question_set_id)
    if not question_set:
        raise HTTPException(status_code=404, detail="Question set not found")
    
    try:
        # Register session with auto GM
        auto_gm.register_session(session)
        
        # Start automatic mode
        await auto_gm.start_automatic_session(
            session_id, request.question_set_id, websocket_manager, request.timers
        )
        
        return {"message": "Automatic mode enabled successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/sessions/{session_id}/dice-question")
async def get_dice_question(session_id: str, player_id: str):
    """Get a random question using dice functionality"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.is_game_master(player_id):
        raise HTTPException(status_code=403, detail="Only game master can use dice")
    
    # For dice mode, we need a question set to be selected
    # This could be from a default set or previously selected set
    available_sets = question_manager.list_question_sets()
    if not available_sets:
        raise HTTPException(status_code=400, detail="No question sets available")
    
    # Use first available set for now (could be enhanced to let GM choose)
    question_set_id = available_sets[0].set_id
    
    try:
        question_data, question_index = question_manager.get_random_question(
            question_set_id, session.used_questions
        )
        
        # Broadcast dice question selection
        await websocket_manager.broadcast_to_session(session_id, {
            "type": "DICE_QUESTION_SELECTED",
            "data": {
                "question": question_data.question,
                "answer": question_data.answer,
                "can_edit": True,
                "question_index": question_index,
                "question_source": "dice"
            }
        })
        
        return {
            "question": question_data.question,
            "answer": question_data.answer,
            "question_index": question_index,
            "can_edit": True
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/sessions/{session_id}/edit-question")
async def edit_current_question(session_id: str, player_id: str, request: EditQuestionRequest):
    """Edit the current question (for dice mode)"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.is_game_master(player_id):
        raise HTTPException(status_code=403, detail="Only game master can edit questions")
    
    try:
        # Start question phase with edited content
        session.start_question_phase(
            request.question,
            request.answer,
            source="dice",
            original_text=session.current_question.text if session.current_question else None,
            original_answer=session.current_question.correct_answer if session.current_question else None
        )
        
        # Broadcast edited question
        await websocket_manager.broadcast_to_session(session_id, {
            "type": "QUESTION_EDITED",
            "data": {
                "question": request.question,
                "game_state": session.game_state.value,
                "round_number": session.round_number,
                "question_source": "dice"
            }
        })
        
        return {"message": "Question edited and submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/sessions/{session_id}/cancel-auto-timer")
async def cancel_auto_timer(session_id: str, player_id: str):
    """Cancel automatic timer for manual intervention"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.is_game_master(player_id):
        raise HTTPException(status_code=403, detail="Only game master can cancel timers")
    
    auto_gm.cancel_timer(session_id)
    
    await websocket_manager.broadcast_to_session(session_id, {
        "type": "AUTO_TIMER_CANCELLED",
        "data": {
            "message": "Automatic timer cancelled - manual control resumed"
        }
    })
    
    return {"message": "Automatic timer cancelled"}

# WebSocket endpoint
@app.websocket("/ws/{session_id}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, player_id: str):
    await websocket_manager.connect(websocket, session_id, player_id)
    try:
        while True:
            # Keep connection alive and handle any incoming messages
            data = await websocket.receive_text()
            # Echo back for now (can be extended for client-to-server messages)
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        await websocket_manager.disconnect(websocket, session_id, player_id)

@app.get("/")
async def root():
    return {"message": "Multiplayer Trivia Game API", "status": "running"}