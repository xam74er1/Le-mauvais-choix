import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useNotification } from '../context/NotificationContext';
import Button from './common/Button';
import AnimatedTransition from './common/AnimatedTransition';

function VotingPhase() {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [endingVote, setEndingVote] = useState(false);
  const { state, actions } = useGame();
  const { showSuccess, showError } = useNotification();

  const handleVote = async (answer) => {
    if (voted || submitting) return;
    
    setSubmitting(true);
    try {
      await actions.submitVote(answer);
      setSelectedAnswer(answer);
      setVoted(true);
      showSuccess('🗳️ Your vote has been recorded!', { 
        icon: '✅',
        duration: 2000 
      });
    } catch (error) {
      showError('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndVoting = async () => {
    if (endingVote) return;
    
    setEndingVote(true);
    try {
      await actions.endVoting();
      showSuccess('🏁 Voting ended! Showing results...', {
        duration: 2000
      });
    } catch (error) {
      showError('Failed to end voting. Please try again.');
    } finally {
      setEndingVote(false);
    }
  };

  const votesCount = state.currentQuestion?.votes_count || 0;
  const totalPlayers = state.players.length;
  const playersWhoCanVote = state.isGameMaster ? totalPlayers - 1 : totalPlayers; // Game master doesn't vote
  const progressPercentage = playersWhoCanVote > 0 ? (votesCount / playersWhoCanVote) * 100 : 0;

  return (
    <AnimatedTransition type="fadeIn">
      {/* Question Section - Priority positioning */}
      <div className="question-area content-section sticky-element">
        <div className="phase-indicator">
          🗳️ Voting Phase: Choose the Correct Answer
        </div>
        
        <h3 className="text-xl font-semibold mb-4 text-inverse">Question</h3>
        <div className="text-lg font-semibold p-5 bg-white bg-opacity-20 rounded mb-5 border border-white border-opacity-30 text-inverse">
          {state.currentQuestion?.text}
        </div>
        
        {/* Show correct answer to Game Master */}
        {state.isGameMaster && (
          <AnimatedTransition type="slideDown" delay={0.2}>
            <div className="p-4 bg-green-600 text-white rounded mb-4 font-semibold">
              <strong>✅ Correct Answer:</strong> {state.currentQuestion?.correct_answer}
            </div>
          </AnimatedTransition>
        )}
        
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span className="font-medium">Voting Progress</span>
            <span className="font-semibold">{votesCount} / {playersWhoCanVote}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Game Master Controls */}
      {state.isGameMaster ? (
        <AnimatedTransition type="slideUp" delay={0.3}>
          <div className="content-section no-overlap">
            <h3 className="text-xl font-semibold mb-4">Game Master Controls</h3>
            <p className="text-secondary mb-6">
              Monitor the voting progress and end the voting phase when ready.
            </p>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'var(--space-4)',
              alignItems: 'center'
            }}>
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius)',
                textAlign: 'center',
                width: '100%',
                maxWidth: '400px'
              }}>
                <div className="text-lg font-semibold mb-2">
                  {votesCount === playersWhoCanVote ? 'All players have voted!' : 'Waiting for votes...'}
                </div>
                <div className="text-secondary">
                  {playersWhoCanVote - votesCount} players remaining
                </div>
              </div>
              
              <Button
                variant="primary"
                size="lg"
                onClick={handleEndVoting}
                loading={endingVote}
                disabled={endingVote}
              >
                {endingVote ? 'Ending Voting...' : '🏁 End Voting & Show Results'}
              </Button>
              
              <p className="text-sm text-muted text-center">
                You can end voting early or wait for all players to vote
              </p>
            </div>
          </div>
        </AnimatedTransition>
      ) : (
        /* Player Voting Interface */
        <AnimatedTransition type="slideUp" delay={0.3}>
          <div className="content-section no-overlap">
            <h3 className="text-xl font-semibold mb-4">Choose Your Answer</h3>
            <p className="mb-6">
              {voted 
                ? "✅ You've voted! Waiting for other players to finish voting..."
                : "Select the answer you think is correct. One of these is real, the others are fake answers from players!"
              }
            </p>
            
            <div className="answer-grid mt-5">
              {state.answers.map((answer, index) => (
                <AnimatedTransition key={index} type="slideUp" delay={0.1 * index}>
                  <button
                    className={`answer-option touch-target ${selectedAnswer === answer ? 'selected' : ''}`}
                    onClick={() => handleVote(answer)}
                    disabled={voted || submitting}
                    style={{
                      opacity: voted && selectedAnswer !== answer ? 0.6 : 1,
                      cursor: voted || submitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedAnswer === answer 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1 text-left">
                        {answer}
                      </div>
                      {selectedAnswer === answer && voted && (
                        <div className="text-green-600 text-lg">✓</div>
                      )}
                    </div>
                  </button>
                </AnimatedTransition>
              ))}
            </div>
            
            {voted && (
              <AnimatedTransition type="slideUp" delay={0.5}>
                <div style={{ 
                  marginTop: 'var(--space-5)', 
                  padding: 'var(--space-4)', 
                  backgroundColor: 'var(--success)', 
                  color: 'var(--text-inverse)',
                  borderRadius: 'var(--border-radius)' 
                }}>
                  <strong>Your vote:</strong> {selectedAnswer}
                </div>
              </AnimatedTransition>
            )}
            
            {!voted && (
              <AnimatedTransition type="slideUp" delay={0.6}>
                <div style={{ 
                  marginTop: 'var(--space-5)', 
                  padding: 'var(--space-4)', 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 className="font-semibold mb-3">🤔 Voting Strategy:</h4>
                  <ul style={{ paddingLeft: 'var(--space-5)', lineHeight: '1.6' }}>
                    <li>Look for answers that sound most factual and authoritative</li>
                    <li>Be wary of answers that seem too obvious or too obscure</li>
                    <li>Consider which answers other players might have created as fakes</li>
                    <li>Trust your instincts, but think about what sounds most plausible</li>
                  </ul>
                </div>
              </AnimatedTransition>
            )}
          </div>
        </AnimatedTransition>
      )}
    </AnimatedTransition>
  );
}

export default VotingPhase;