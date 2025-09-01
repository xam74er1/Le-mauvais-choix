import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useNotification } from '../context/NotificationContext';
import Button from './common/Button';
import AnimatedTransition from './common/AnimatedTransition';

function SubmissionPhase() {
  const [fakeAnswer, setFakeAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [endingSubmissions, setEndingSubmissions] = useState(false);
  const { state, actions } = useGame();
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fakeAnswer.trim() || submitted) {
      return;
    }

    setSubmitting(true);
    try {
      await actions.submitAnswer(fakeAnswer.trim());
      setSubmitted(true);
      showSuccess('📤 Your fake answer has been submitted!', { 
        icon: '✅',
        duration: 2000 
      });
    } catch (error) {
      showError('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndSubmissions = async () => {
    if (endingSubmissions) return;
    
    setEndingSubmissions(true);
    try {
      await actions.endSubmissionPhase();
      showSuccess('🏁 Submission phase ended! Moving to voting...', {
        duration: 2000
      });
    } catch (error) {
      showError('Failed to end submission phase. Please try again.');
    } finally {
      setEndingSubmissions(false);
    }
  };

  const nonGameMasterPlayers = state.players.filter(p => !p.is_game_master);
  const submissionsCount = state.currentQuestion?.submissions_count || 0;
  const totalExpected = nonGameMasterPlayers.length;
  const progressPercentage = totalExpected > 0 ? (submissionsCount / totalExpected) * 100 : 0;

  return (
    <AnimatedTransition type="fadeIn">
      {/* Question Section - Prominent for Game Master */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        padding: 'var(--space-6)',
        borderRadius: 'var(--border-radius-lg)',
        marginBottom: 'var(--space-6)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div className="phase-indicator">
          📝 Submission Phase: Create Your Fake Answer
        </div>
        
        <h3 className="text-xl font-semibold mb-4">Question</h3>
        <div style={{ 
          fontSize: 'var(--text-lg)', 
          fontWeight: '600', 
          padding: 'var(--space-5)', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--border-radius)',
          marginBottom: 'var(--space-5)',
          border: '1px solid var(--border-color)'
        }}>
          {state.currentQuestion?.text}
        </div>
        
        {/* Show correct answer to Game Master */}
        {state.isGameMaster && (
          <AnimatedTransition type="slideDown" delay={0.2}>
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--success)',
              color: 'var(--text-inverse)',
              borderRadius: 'var(--border-radius)',
              marginBottom: 'var(--space-4)',
              fontWeight: '600'
            }}>
              <strong>✅ Correct Answer:</strong> {state.currentQuestion?.correct_answer}
            </div>
          </AnimatedTransition>
        )}
        
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span className="font-medium">Submissions Progress</span>
            <span className="font-semibold">{submissionsCount} / {totalExpected}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {state.isGameMaster ? (
        <AnimatedTransition type="slideUp" delay={0.3}>
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">🎮 Game Master View</h3>
            <p className="text-secondary mb-6">
              Waiting for all players to submit their fake answers...
            </p>
            
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center',
              marginBottom: 'var(--space-6)'
            }}>
              <div className="text-lg font-semibold mb-2">
                {submissionsCount === totalExpected ? 'All answers submitted!' : 'Waiting for submissions...'}
              </div>
              <div className="text-secondary">
                {totalExpected - submissionsCount} players remaining
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'var(--space-4)',
              alignItems: 'center',
              marginBottom: 'var(--space-6)'
            }}>
              <Button
                variant="primary"
                size="lg"
                onClick={handleEndSubmissions}
                loading={endingSubmissions}
                disabled={endingSubmissions}
              >
                {endingSubmissions ? 'Ending Submissions...' : '🏁 End Submissions & Start Voting'}
              </Button>
              
              <p className="text-sm text-muted text-center">
                You can end submissions early or wait for all players to submit
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Players ({nonGameMasterPlayers.length})</h4>
              <AnimatedTransition type="stagger" stagger={true}>
                {nonGameMasterPlayers.map((player, index) => (
                  <div key={player.player_id} className="player-item" style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--border-radius)',
                    marginBottom: 'var(--space-2)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <span className="font-medium">{player.pseudonym}</span>
                    <span style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)'
                    }}>
                      ⏳ Waiting...
                    </span>
                  </div>
                ))}
              </AnimatedTransition>
            </div>
          </div>
        </AnimatedTransition>
      ) : (
        <AnimatedTransition type="slideUp" delay={0.3}>
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Submit Your Fake Answer</h3>
            <p className="mb-6">
              Create a believable fake answer that might fool other players into thinking it's correct.
            </p>
            
            {submitted ? (
              <AnimatedTransition type="scaleIn">
                <div className="success">
                  ✅ Your fake answer has been submitted! Waiting for other players...
                </div>
              </AnimatedTransition>
            ) : (
              <AnimatedTransition type="slideUp" delay={0.1}>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="label" htmlFor="fakeAnswer">
                      Your Fake Answer
                    </label>
                    <input
                      id="fakeAnswer"
                      type="text"
                      className="input"
                      value={fakeAnswer}
                      onChange={(e) => setFakeAnswer(e.target.value)}
                      placeholder="Enter a believable fake answer..."
                      maxLength={100}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={submitting}
                    disabled={submitting || !fakeAnswer.trim()}
                  >
                    {submitting ? 'Submitting...' : '📤 Submit Fake Answer'}
                  </Button>
                </form>
              </AnimatedTransition>
            )}
            
            <AnimatedTransition type="slideUp" delay={0.4}>
              <div style={{ 
                marginTop: 'var(--space-6)', 
                padding: 'var(--space-4)', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)'
              }}>
                <h4 className="font-semibold mb-3">💡 Strategy Tips:</h4>
                <ul style={{ paddingLeft: 'var(--space-5)', lineHeight: '1.6' }}>
                  <li>Make your answer sound plausible and factual</li>
                  <li>Consider what others might think is correct</li>
                  <li>Avoid answers that are obviously fake or silly</li>
                  <li>Think about common misconceptions or similar-sounding facts</li>
                </ul>
              </div>
            </AnimatedTransition>
          </div>
        </AnimatedTransition>
      )}
    </AnimatedTransition>
  );
}

export default SubmissionPhase;