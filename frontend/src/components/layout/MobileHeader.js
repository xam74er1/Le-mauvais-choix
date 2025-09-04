import React, { useState } from 'react';

const MobileHeader = ({ 
  title = 'Trivia Game',
  gameId,
  onMenuToggle,
  onCopyGameId,
  onLeaveGame,
  showGameId = true,
  className = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedGameId, setCopiedGameId] = useState(false);

  const handleCopyGameId = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopiedGameId(true);
      if (onCopyGameId) onCopyGameId();
      
      setTimeout(() => setCopiedGameId(false), 2000);
      setIsMenuOpen(false);
    } catch (err) {
      console.error('Failed to copy game ID:', err);
    }
  };

  const handleMenuToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (onMenuToggle) onMenuToggle(newState);
  };

  const handleLeaveGame = () => {
    setIsMenuOpen(false);
    if (onLeaveGame) onLeaveGame();
  };

  return (
    <header className={`game-header ${className}`}>
      <h1 className="text-subheading font-semibold text-primary m-0">{title}</h1>
      
      <div className="flex items-center gap-sm">
        {showGameId && gameId && (
          <div 
            className="flex items-center gap-xs px-md py-sm rounded-lg text-caption font-semibold cursor-pointer transition-all hover-lift"
            onClick={handleCopyGameId}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)',
              letterSpacing: '0.05em'
            }}
          >
            <span>{copiedGameId ? '✓ Copied' : gameId}</span>
            <span className="text-micro">{copiedGameId ? '' : '📋'}</span>
          </div>
        )}
        
        <button 
          className="bg-transparent border-0 text-subheading text-primary cursor-pointer px-sm py-sm rounded-lg hover:bg-secondary transition-all touch-target"
          onClick={handleMenuToggle}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {isMenuOpen && (
        <div 
          className="absolute top-full right-4 rounded-xl shadow-lg min-w-200 z-dropdown border transition-all"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          {gameId && (
            <button 
              className="w-full px-lg py-md border-0 bg-transparent text-left cursor-pointer hover:bg-secondary transition-all text-body text-primary rounded-t-xl"
              onClick={handleCopyGameId}
            >
              📋 Copy Game ID
            </button>
          )}
          <button 
            className="w-full px-lg py-md border-0 bg-transparent text-left cursor-pointer hover:bg-secondary transition-all text-body text-primary rounded-b-xl"
            onClick={handleLeaveGame}
          >
            🚪 Leave Game
          </button>
        </div>
      )}
    </header>
  );
};

export default MobileHeader;