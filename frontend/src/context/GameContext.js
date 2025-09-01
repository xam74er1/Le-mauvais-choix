import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GameContext = createContext();

const initialState = {
  sessionId: null,
  playerId: null,
  playerName: null,
  isGameMaster: false,
  gameState: 'waiting_for_players',
  players: [],
  scores: {},
  currentQuestion: null,
  answers: [],
  results: null,
  roundNumber: 0,
  websocket: null,
  connected: false,
  error: null,
  loading: false
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_SESSION_INFO':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        playerId: action.payload.playerId,
        playerName: action.payload.playerName,
        isGameMaster: action.payload.isGameMaster
      };

    case 'SET_WEBSOCKET':
      return { ...state, websocket: action.payload };

    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };

    case 'UPDATE_GAME_STATE':
      return {
        ...state,
        gameState: action.payload.gameState,
        players: action.payload.players || state.players,
        scores: action.payload.scores || state.scores,
        roundNumber: action.payload.roundNumber || state.roundNumber,
        currentQuestion: action.payload.currentQuestion || state.currentQuestion,
        answers: action.payload.answers || state.answers,
        results: action.payload.results || state.results
      };

    case 'PLAYER_JOINED':
      return {
        ...state,
        players: [...state.players, action.payload.player]
      };

    case 'QUESTION_SUBMITTED':
      console.log('Reducer QUESTION_SUBMITTED:', action.payload);  // Debug log
      const newState = {
        ...state,
        gameState: 'submission_phase',
        currentQuestion: { text: action.payload.question },
        roundNumber: action.payload.round_number || action.payload.roundNumber,
        answers: [],
        results: null
      };
      console.log('New state after QUESTION_SUBMITTED:', newState);  // Debug log
      return newState;

    case 'VOTING_PHASE_STARTED':
      return {
        ...state,
        gameState: 'voting_phase',
        answers: action.payload.answers
      };

    case 'RESULTS_READY':
      return {
        ...state,
        gameState: 'results_phase',
        results: action.payload.results,
        scores: action.payload.results.scores
      };

    case 'NEXT_ROUND_STARTED':
      return {
        ...state,
        gameState: 'waiting_for_players',
        currentQuestion: null,
        answers: [],
        results: null
      };

    case 'RESET_GAME':
      return initialState;

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // WebSocket connection management
  const connectWebSocket = (sessionId, playerId) => {
    if (state.websocket) {
      state.websocket.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/${sessionId}/${playerId}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      dispatch({ type: 'SET_CONNECTED', payload: true });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      dispatch({ type: 'SET_CONNECTED', payload: false });

      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (state.sessionId && state.playerId) {
          connectWebSocket(state.sessionId, state.playerId);
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Connection error. Trying to reconnect...' });
    };

    dispatch({ type: 'SET_WEBSOCKET', payload: ws });
  };

  const handleWebSocketMessage = (message) => {
    console.log('WebSocket message:', message);

    switch (message.type) {
      case 'CONNECTION_ESTABLISHED':
        dispatch({ type: 'CLEAR_ERROR' });
        break;

      case 'PLAYER_JOINED':
        dispatch({ type: 'PLAYER_JOINED', payload: message.data });
        break;

      case 'QUESTION_SUBMITTED':
        console.log('Received QUESTION_SUBMITTED:', message.data);  // Debug log
        dispatch({ type: 'QUESTION_SUBMITTED', payload: message.data });
        break;

      case 'ANSWER_SUBMITTED':
        dispatch({
          type: 'UPDATE_GAME_STATE',
          payload: {
            currentQuestion: {
              ...state.currentQuestion,
              submissions_count: message.data.submissions_count
            }
          }
        });
        break;

      case 'SUBMISSIONS_ENDED_EARLY':
      case 'VOTING_PHASE_STARTED':
        dispatch({ type: 'VOTING_PHASE_STARTED', payload: message.data });
        break;

      case 'VOTE_SUBMITTED':
        dispatch({
          type: 'UPDATE_GAME_STATE',
          payload: {
            currentQuestion: {
              ...state.currentQuestion,
              votes_count: message.data.votes_count
            }
          }
        });
        break;

      case 'VOTING_ENDED_EARLY':
      case 'RESULTS_READY':
        dispatch({ type: 'RESULTS_READY', payload: message.data });
        break;

      case 'NEXT_ROUND_STARTED':
        dispatch({ type: 'NEXT_ROUND_STARTED', payload: message.data });
        break;

      default:
        console.log('Unhandled message type:', message.type);
    }
  };

  // API helper functions
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const actions = {
    createSession: async (gameMasterPseudonym) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await apiCall('/sessions', {
          method: 'POST',
          body: JSON.stringify({ game_master_pseudonym: gameMasterPseudonym })
        });

        dispatch({
          type: 'SET_SESSION_INFO',
          payload: {
            sessionId: response.session_id,
            playerId: response.player_id,
            playerName: gameMasterPseudonym,
            isGameMaster: true
          }
        });

        connectWebSocket(response.session_id, response.player_id);
        return response;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    joinSession: async (sessionId, pseudonym) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await apiCall(`/sessions/${sessionId}/join`, {
          method: 'POST',
          body: JSON.stringify({ pseudonym })
        });

        dispatch({
          type: 'SET_SESSION_INFO',
          payload: {
            sessionId: sessionId,
            playerId: response.player_id,
            playerName: pseudonym,
            isGameMaster: false
          }
        });

        dispatch({ type: 'UPDATE_GAME_STATE', payload: response.session_state });
        connectWebSocket(sessionId, response.player_id);
        return response;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    submitQuestion: async (question, correctAnswer) => {
      try {
        await apiCall(`/sessions/${state.sessionId}/questions?player_id=${state.playerId}`, {
          method: 'POST',
          body: JSON.stringify({ question, answer: correctAnswer })
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    submitAnswer: async (fakeAnswer) => {
      try {
        await apiCall(`/sessions/${state.sessionId}/answers?player_id=${state.playerId}`, {
          method: 'POST',
          body: JSON.stringify({ fake_answer: fakeAnswer })
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    submitVote: async (votedAnswer) => {
      try {
        await apiCall(`/sessions/${state.sessionId}/votes?player_id=${state.playerId}`, {
          method: 'POST',
          body: JSON.stringify({ voted_answer: votedAnswer })
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    endVoting: async () => {
      try {
        await apiCall(`/sessions/${state.sessionId}/end-voting?player_id=${state.playerId}`, {
          method: 'POST'
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    endSubmissionPhase: async () => {
      try {
        await apiCall(`/sessions/${state.sessionId}/end-submissions?player_id=${state.playerId}`, {
          method: 'POST'
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    startNextRound: async () => {
      try {
        await apiCall(`/sessions/${state.sessionId}/next-round?player_id=${state.playerId}`, {
          method: 'POST'
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    }
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (state.websocket) {
        state.websocket.close();
      }
    };
  }, []);

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}