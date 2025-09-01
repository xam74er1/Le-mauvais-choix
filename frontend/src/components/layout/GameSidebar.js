import React, { useState } from 'react';
import AnimatedTransition from '../common/AnimatedTransition';

const GameSidebar = ({ 
  gameId, 
  players = [], 
  scores = {}, 
  currentPlayer,
  onCopyGameId,
  extraActions = null,
  className = '' 
}) => {
  const [copiedGameId, setCopiedGameId] = useState(false);

  const handleCopyGameId = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopiedGameId(true);
      if (onCopyGameId) onCopyGameId();
      
      setTimeout(() => setCopiedGameId(false), 2000);
    } catch (err) {
      console.error('Failed to copy game ID:', err);
    }
  };

  return (
    <aside className={`game-sidebar ${className}`}>
      {/* Game ID Header */}
      <div className="p-6 border-b border-gray-300" style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}>
        <div className="text-center mb-4">
          <div className="text-sm opacity-90 mb-1">Game ID</div>
          <div 
            className="text-2xl font-bold cursor-pointer p-2 rounded transition-colors"
            onClick={handleCopyGameId}
            title="Click to copy"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              letterSpacing: '0.1em'
            }}
          >
            {copiedGameId ? '✓ Copied!' : gameId}
          </div>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Extra Actions (Auto Mode button, etc.) */}
        {extraActions && (
          <div className="mb-6">
            {extraActions}
          </div>
        )}

        {/* Players List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Players ({players.length})
          </h3>
          
          <AnimatedTransition type="stagger" stagger={true}>
            {players.map((player, index) => (
              <div 
                key={player.id || index}
                className="player-item"
              >
                <div>
                  <span className="font-medium text-primary">
                    {player.pseudonym}
                    {player.id === currentPlayer?.id && ' (You)'}
                  </span>
                  <span 
                    className={`text-xs p-1 px-2 rounded ml-2 text-white ${
                      player.is_game_master ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    {player.is_game_master ? 'Game Master' : 'Player'}
                  </span>
                </div>
                <span className="score">
                  {scores[player.id] || 0} pts
                </span>
              </div>
            ))}
          </AnimatedTransition>

          {players.length === 0 && (
            <div className="text-center text-muted p-8">
              Waiting for players to join...
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default GameSidebar;