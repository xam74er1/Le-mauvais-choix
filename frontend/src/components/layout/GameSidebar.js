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
      {/* Compact Game ID Header */}
      <div className="px-lg py-md border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex justify-between items-center">
          <div className="text-caption text-tertiary font-medium">Game ID</div>
          <div 
            className="flex items-center gap-sm cursor-pointer px-md py-sm rounded-lg transition-all hover-lift"
            onClick={handleCopyGameId}
            title="Click to copy Game ID"
            style={{ 
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}
          >
            <span className="text-body font-semibold text-primary" style={{ letterSpacing: '0.05em' }}>
              {gameId}
            </span>
            <span className="text-caption text-secondary">
              {copiedGameId ? '✓' : '📋'}
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 px-lg py-lg overflow-y-auto">
        {/* Extra Actions (Auto Mode button, etc.) */}
        {extraActions && (
          <div className="space-component">
            {extraActions}
          </div>
        )}

        {/* Players List */}
        <div>
          <h3 className="text-subheading font-semibold space-element text-primary">
            Players ({players.length})
          </h3>
          
          <AnimatedTransition type="stagger" stagger={true}>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div 
                  key={player.id || index}
                  className="flex justify-between items-center px-md py-md rounded-lg transition-all hover-lift"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color-light)'
                  }}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-sm">
                      <span className="text-body font-medium text-primary">
                        {player.pseudonym}
                      </span>
                      {player.id === currentPlayer?.id && (
                        <span className="text-caption text-accent">(You)</span>
                      )}
                    </div>
                    <span 
                      className={`text-micro font-semibold px-sm py-xs rounded text-white inline-block mt-xs ${
                        player.is_game_master ? 'bg-primary' : ''
                      }`}
                      style={{
                        backgroundColor: player.is_game_master ? 'var(--primary)' : 'var(--accent-info)',
                        fontSize: 'var(--text-micro)'
                      }}
                    >
                      {player.is_game_master ? 'Game Master' : 'Player'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-subheading font-bold text-primary">
                      {scores[player.id] || 0}
                    </div>
                    <div className="text-caption text-secondary">pts</div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedTransition>

          {players.length === 0 && (
            <div className="text-center text-muted py-xl">
              <div className="text-body">Waiting for players to join...</div>
              <div className="text-caption mt-sm">Share the Game ID above</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default GameSidebar;