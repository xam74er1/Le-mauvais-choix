import React from 'react';
import Button from '../common/Button';

const AutoModeProgress = ({ 
  currentPhase, 
  timeRemaining, 
  totalTime, 
  questionNumber, 
  totalQuestions,
  onCancelTimer,
  isGameMaster = false 
}) => {
  const getPhaseDisplay = (phase) => {
    switch (phase) {
      case 'SUBMISSION_PHASE':
        return { name: 'Submission Phase', icon: '✏️', description: 'Players are submitting fake answers' };
      case 'VOTING_PHASE':
        return { name: 'Voting Phase', icon: '🗳️', description: 'Players are voting on answers' };
      case 'RESULTS_PHASE':
        return { name: 'Results Phase', icon: '📊', description: 'Showing results and scores' };
      default:
        return { name: phase, icon: '⏱️', description: 'Game in progress' };
    }
  };

  const phaseInfo = getPhaseDisplay(currentPhase);
  const progressPercentage = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 10) return 'text-red-600';
    if (timeRemaining <= 30) return 'text-yellow-600';
    return 'text-primary';
  };

  return (
    <div className="auto-mode-progress">
      <div className="auto-mode-indicator mb-4">
        <span>🤖</span>
        <span>Automatic Mode Active</span>
        {questionNumber && totalQuestions && (
          <span className="ml-2 text-xs opacity-75">
            Question {questionNumber}/{totalQuestions}
          </span>
        )}
      </div>

      <div className="phase-progress">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{phaseInfo.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{phaseInfo.name}</h3>
            <p className="text-sm text-muted">{phaseInfo.description}</p>
          </div>
        </div>
      </div>

      <div className="timer-section mb-4">
        <div className={`timer-display ${getTimerColor()}`}>
          {formatTime(timeRemaining)}
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>0s</span>
          <span>{formatTime(totalTime)}</span>
        </div>
      </div>

      {isGameMaster && (
        <div className="game-master-controls">
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onCancelTimer}
              className="flex-1 text-sm"
            >
              ⏸️ Pause Timer
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => {
                // This would trigger manual phase progression
                // Implementation depends on your WebSocket setup
              }}
              className="flex-1 text-sm"
            >
              ⏭️ Skip Phase
            </Button>
          </div>
          
          <p className="text-xs text-muted text-center mt-2">
            You can pause the timer or skip to the next phase manually
          </p>
        </div>
      )}

      {timeRemaining <= 10 && (
        <div className="countdown-warning text-center mt-4">
          <div className="pulse">
            <span className="text-lg">⏰</span>
            <span className="ml-2 font-semibold text-red-600">
              Time almost up!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoModeProgress;