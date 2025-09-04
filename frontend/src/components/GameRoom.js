import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import { useNotification } from '../context/NotificationContext';
import GameLayout from './layout/GameLayout';
import GameLobby from './GameLobby';
import QuestionPhase from './QuestionPhase';
import SubmissionPhase from './SubmissionPhase';
import VotingPhase from './VotingPhase';
import ResultsPhase from './ResultsPhase';
import ConnectionStatus from './ConnectionStatus';
import AnimatedTransition from './common/AnimatedTransition';
import PhaseTransition from './common/PhaseTransition';
import AutoModeSetup from './auto/AutoModeSetup';
import AutoModeProgress from './auto/AutoModeProgress';
import DiceQuestionSelector from './dice/DiceQuestionSelector';

function GameRoom() {
  const { sessionId } = useParams();
  const { state } = useGame();
  const { showSuccess, showInfo } = useNotification();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showAutoSetup, setShowAutoSetup] = useState(false);
  const [autoModeProgress, setAutoModeProgress] = useState(null);

  useEffect(() => {
    // If no session info, redirect to home
    if (!state.sessionId || state.sessionId !== sessionId) {
      navigate('/');
    }
  }, [state.sessionId, sessionId, navigate]);

  // Listen for automatic mode progress updates
  useEffect(() => {
    if (state.websocket) {
      const handleMessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'AUTO_MODE_PROGRESS') {
          setAutoModeProgress(message.data);
        } else if (message.type === 'AUTO_TIMER_CANCELLED') {
          setAutoModeProgress(null);
          showInfo(message.data.message);
        }
      };

      state.websocket.addEventListener('message', handleMessage);
      return () => {
        state.websocket.removeEventListener('message', handleMessage);
      };
    }
  }, [state.websocket, showInfo]);

  if (!state.sessionId) {
    return (
      <div className="loading">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  const renderGamePhase = () => {
    // Show auto mode setup if requested
    if (showAutoSetup && state.isGameMaster) {
      return (
        <AutoModeSetup
          sessionId={state.sessionId}
          playerId={state.playerId}
          onAutoModeEnabled={() => {
            setShowAutoSetup(false);
            showSuccess(t('game.notifications.auto_mode_enabled'));
          }}
        />
      );
    }

    switch (state.gameState) {
      case 'waiting_for_players':
        return state.isGameMaster ? <QuestionPhase /> : <GameLobby />;
      case 'submission_phase':
        return <SubmissionPhase />;
      case 'voting_phase':
        return <VotingPhase />;
      case 'results_phase':
        return <ResultsPhase />;
      default:
        return <GameLobby />;
    }
  };

  const handleCopyGameId = async () => {
    try {
      await navigator.clipboard.writeText(state.sessionId);
      showSuccess(t('game.notifications.game_id_copied'), { duration: 2000 });
    } catch (error) {
      showInfo(`${t('game.labels.session_id')}: ${state.sessionId}`, { duration: 4000 });
    }
  };

  const handleLeaveGame = () => {
    navigate('/');
  };

  const handleCancelAutoTimer = async () => {
    try {
      const response = await fetch(`/sessions/${state.sessionId}/cancel-auto-timer?player_id=${state.playerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAutoModeProgress(null);
      }
    } catch (error) {
      console.error('Error cancelling auto timer:', error);
    }
  };

  return (
    <GameLayout
      gameId={state.sessionId}
      players={state.players}
      scores={state.scores || {}}
      currentPlayer={{
        id: state.playerId,
        pseudonym: state.playerName,
        is_game_master: state.isGameMaster
      }}
      onCopyGameId={handleCopyGameId}
      onLeaveGame={handleLeaveGame}
      stickyQuestion={state.gameState === 'submission_phase' || state.gameState === 'voting_phase'}
      extraActions={
        state.isGameMaster && !showAutoSetup ? (
          <div className="game-master-actions">
            <button
              onClick={() => setShowAutoSetup(true)}
              className="button secondary text-sm mb-2 w-full"
              title="Enable automatic game master mode"
            >
              🤖 Auto Mode
            </button>
          </div>
        ) : null
      }
    >
      <ConnectionStatus />
      
      {/* Automatic Mode Progress */}
      {autoModeProgress && (
        <AnimatedTransition type="slideDown">
          <AutoModeProgress
            currentPhase={autoModeProgress.current_phase}
            timeRemaining={autoModeProgress.time_remaining}
            totalTime={autoModeProgress.total_time}
            questionNumber={autoModeProgress.question_number}
            totalQuestions={autoModeProgress.total_questions}
            onCancelTimer={handleCancelAutoTimer}
            isGameMaster={state.isGameMaster}
          />
        </AnimatedTransition>
      )}
      
      {/* Game Status Header */}
      <AnimatedTransition type="slideDown">
        <div className="content-section">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-title font-bold space-content text-primary">
                {t('game.labels.round')} {state.roundNumber}
              </h2>
              <p className="text-body text-secondary">
                {t('game.labels.playing_as')}: <strong className="text-primary">{state.playerName}</strong>
                {state.isGameMaster && (
                  <span className="px-sm py-xs rounded-lg text-micro font-semibold text-white ml-sm"
                        style={{ backgroundColor: 'var(--primary)' }}>
                    {t('game.labels.game_master')}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-body font-medium text-primary">{t('game.labels.players')}: {state.players.length}</div>
              <div className="text-caption text-secondary">{t('game.labels.state')}: {t(`game.phases.${state.gameState}`)}</div>
            </div>
          </div>
        </div>
      </AnimatedTransition>
      
      {/* Game Master Tools */}
      {state.isGameMaster && state.gameState === 'waiting_for_players' && !showAutoSetup && (
        <AnimatedTransition type="slideDown">
          <div className="content-section">
            <h3 className="text-heading font-semibold space-element text-primary">Game Master Tools</h3>
            <div className="grid md:grid-cols-2 gap-lg">
              <button
                onClick={() => setShowAutoSetup(true)}
                className="text-left px-lg py-xl rounded-xl transition-all hover-lift"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div className="text-subheading font-semibold text-primary space-content">🤖 Automatic Mode</div>
                  <div className="text-body text-secondary">
                    Let the system run the game automatically with CSV questions
                  </div>
                </div>
              </button>
              
              <div className="px-lg py-xl rounded-xl" style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}>
                <div className="text-subheading font-semibold text-primary space-content">🎲 Dice Questions</div>
                <div className="text-body text-secondary space-element">
                  Get random questions that you can edit before presenting
                </div>
                <DiceQuestionSelector
                  sessionId={state.sessionId}
                  playerId={state.playerId}
                  onQuestionSelected={(question) => {
                    showInfo(`🎲 Random question selected: ${question.question.substring(0, 50)}...`);
                  }}
                />
              </div>
            </div>
          </div>
        </AnimatedTransition>
      )}
      
      {state.error && (
        <AnimatedTransition type="slideDown">
          <div className="error-message">
            {state.error}
            <button 
              onClick={() => state.actions?.clearError()} 
              className="ml-4 text-lg"
            >
              ✕
            </button>
          </div>
        </AnimatedTransition>
      )}

      <PhaseTransition currentPhase={state.gameState}>
        <AnimatedTransition type="phaseTransition" key={state.gameState}>
          {renderGamePhase()}
        </AnimatedTransition>
      </PhaseTransition>
    </GameLayout>
  );
}

export default GameRoom;