import React from 'react';
import { useGame } from '../context/GameContext';
import { useNotification } from '../context/NotificationContext';
import Button from './common/Button';
import AnimatedTransition from './common/AnimatedTransition';

function ResultsPhase() {
  const { state, actions } = useGame();
  const { showSuccess, showError } = useNotification();
  const results = state.results;

  const handleNextRound = async () => {
    try {
      await actions.startNextRound();
      showSuccess('🔄 Starting next round!', { duration: 2000 });
    } catch (error) {
      showError('Failed to start next round. Please try again.');
    }
  };

  if (!results) {
    return (
      <div className="loading">
        <p>Loading results...</p>
      </div>
    );
  }

  // Sort players by total score for leaderboard
  const sortedPlayers = [...state.players].sort(
    (a, b) => (state.scores[b.player_id] || 0) - (state.scores[a.player_id] || 0)
  );

  return (
    <AnimatedTransition type="fadeIn">
      <div className="phase-indicator">
        🏆 Results: Round {state.roundNumber}
      </div>

      {/* Question & Correct Answer */}
      <AnimatedTransition type="slideUp" delay={0.2}>
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Question</h3>
          <div
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              padding: 'var(--space-5)',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius)',
              marginBottom: 'var(--space-5)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            {results.question}
          </div>

          <AnimatedTransition type="bounceIn" delay={0.4}>
            <div
              style={{
                padding: 'var(--space-5)',
                backgroundColor: 'var(--success)',
                color: 'var(--text-inverse)',
                borderRadius: 'var(--border-radius)',
                marginBottom: 'var(--space-5)',
                border: '2px solid var(--success)',
              }}
            >
              <h4
                style={{
                  margin: '0 0 var(--space-2) 0',
                  fontWeight: '600',
                }}
              >
                ✅ Correct Answer:
              </h4>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: '700' }}>
                {results.correct_answer}
              </div>
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  opacity: 0.9,
                }}
              >
                {results.vote_counts[results.correct_answer] || 0} players voted
                for this (+1 point each)
              </div>
            </div>
          </AnimatedTransition>
        </div>
      </AnimatedTransition>

      {/* Vote Results */}
      <AnimatedTransition type="slideUp" delay={0.6}>
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Vote Results</h3>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <strong>Scoring:</strong> Get 1 point for voting correctly + 1 point for each vote your fake answer receives
          </div>
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <AnimatedTransition type="stagger" stagger={true}>
              {Object.entries(results.vote_counts)
                .sort(([, a], [, b]) => b - a)
                .map(([answer, votes]) => {
                  const isCorrect = answer === results.correct_answer;
                  const fakeAnswerAuthor = Object.entries(results.fake_answers).find(
                    ([, fakeAnswer]) => fakeAnswer === answer
                  )?.[0];

                  return (
                    <div
                      key={answer}
                      style={{
                        padding: 'var(--space-4)',
                        marginBottom: 'var(--space-3)',
                        borderRadius: 'var(--border-radius)',
                        backgroundColor: isCorrect
                          ? 'var(--success)'
                          : 'var(--bg-secondary)',
                        color: isCorrect
                          ? 'var(--text-inverse)'
                          : 'var(--text-primary)',
                        border: `2px solid ${
                          isCorrect ? 'var(--success)' : 'var(--border-color)'
                        }`,
                        boxShadow: isCorrect
                          ? 'var(--shadow-md)'
                          : 'var(--shadow-sm)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: '600',
                              marginBottom: 'var(--space-1)',
                            }}
                          >
                            {answer}
                            {isCorrect && (
                              <span style={{ marginLeft: 'var(--space-2)' }}>
                                ✅ CORRECT
                              </span>
                            )}
                          </div>
                          {fakeAnswerAuthor && (
                            <div
                              style={{
                                fontSize: 'var(--text-sm)',
                                opacity: isCorrect ? 0.9 : 0.7,
                              }}
                            >
                              Fake answer by:{' '}
                              <strong>{fakeAnswerAuthor}</strong>
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 'var(--text-lg)',
                            fontWeight: '700',
                            padding: 'var(--space-2) var(--space-3)',
                            backgroundColor: isCorrect
                              ? 'rgba(255,255,255,0.2)'
                              : 'var(--primary)',
                            color: isCorrect ? 'inherit' : 'var(--text-inverse)',
                            borderRadius: 'var(--border-radius)',
                            minWidth: '60px',
                            textAlign: 'center',
                          }}
                        >
                          {votes} vote{votes !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </AnimatedTransition>
          </div>
        </div>
      </AnimatedTransition>

      {/* Leaderboard */}
      <AnimatedTransition type="slideUp" delay={0.8}>
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">🏆 Leaderboard</h3>
          <ul className="player-list">
            <AnimatedTransition type="stagger" stagger={true}>
              {sortedPlayers.map((player, index) => {
                const totalScore = state.scores[player.player_id] || 0;
                const roundScore = results.round_scores?.[player.player_id] || 0;

                return (
                  <li
                    key={player.player_id}
                    className="player-item"
                    style={{
                      background:
                        index === 0
                          ? 'linear-gradient(135deg, #ffd700, #ffed4e)'
                          : index === 1
                          ? 'linear-gradient(135deg, #c0c0c0, #e5e5e5)'
                          : index === 2
                          ? 'linear-gradient(135deg, #cd7f32, #daa520)'
                          : 'var(--bg-secondary)',
                      color:
                        index < 3 ? 'var(--text-on-dark)' : 'var(--text-primary)',
                      border:
                        index < 3 ? 'none' : '1px solid var(--border-color)',
                      boxShadow:
                        index === 0 ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor:
                            index === 0
                              ? 'rgba(255,255,255,0.3)'
                              : index === 1
                              ? 'rgba(0,0,0,0.2)'
                              : index === 2
                              ? 'rgba(255,255,255,0.2)'
                              : 'var(--primary)',
                          color: index < 3 ? 'inherit' : 'var(--text-inverse)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--text-sm)',
                          fontWeight: '700',
                        }}
                      >
                        {index === 0 ? '👑' : index + 1}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: '600',
                            fontSize: 'var(--text-base)',
                          }}
                        >
                          {player.pseudonym}
                          {player.is_game_master && (
                            <span className="game-master">Game Master</span>
                          )}
                        </div>
                        {roundScore > 0 && (
                          <div
                            style={{
                              fontSize: 'var(--text-sm)',
                              opacity: 0.8,
                              fontWeight: '500',
                            }}
                          >
                            +{roundScore} this round
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: '700',
                        color: index === 0 ? 'inherit' : 'var(--primary)',
                      }}
                    >
                      {totalScore} pts
                    </div>
                  </li>
                );
              })}
            </AnimatedTransition>
          </ul>
        </div>
      </AnimatedTransition>

      {/* Game Master Controls */}
      {state.isGameMaster && (
        <AnimatedTransition type="slideUp" delay={1.0}>
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">
              🎮 Game Master Controls
            </h3>
            <p className="text-secondary mb-6">Ready to start the next round?</p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                alignItems: 'center',
              }}
            >
              <Button variant="primary" size="lg" onClick={handleNextRound}>
                🔄 Start Next Round
              </Button>

              <Button
                variant="secondary"
                onClick={() => (window.location.href = '/')}
              >
                🏁 End Game
              </Button>
            </div>
          </div>
        </AnimatedTransition>
      )}
    </AnimatedTransition>
  );
}

export default ResultsPhase;
