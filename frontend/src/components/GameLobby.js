import React from 'react';
import { useGame } from '../context/GameContext';

function GameLobby() {
  const { state } = useGame();

  return (
    <div>
      <div className="phase-indicator">
        🏠 Waiting for Game Master to Start Next Round
      </div>
      
      <div className="card">
        <h3>Players in Game ({state.players.length})</h3>
        <ul className="player-list">
          {state.players.map((player) => (
            <li key={player.player_id} className="player-item">
              <div>
                <strong>{player.pseudonym}</strong>
                {player.is_game_master && <span className="game-master">Game Master</span>}
              </div>
              <div className="score">
                {state.scores[player.player_id] || 0} pts
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="card">
        <h3>Game Instructions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <h4>📝 Submission Phase</h4>
            <p>Create a fake answer that looks believable to fool other players.</p>
          </div>
          <div>
            <h4>🗳️ Voting Phase</h4>
            <p>Vote for the answer you think is the real one among all submissions.</p>
          </div>
          <div>
            <h4>🏆 Scoring</h4>
            <p>Earn points equal to the number of players who vote for your fake answer.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameLobby;