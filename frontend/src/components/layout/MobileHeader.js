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
      <h1 className="text-lg font-semibold text-primary m-0">{title}</h1>
      
      <div className="flex items-center gap-2">
        {showGameId && gameId && (
          <div 
            className="bg-primary text-white px-3 py-1 rounded text-sm font-semibold cursor-pointer hover:bg-primary-dark transition-colors"
            onClick={handleCopyGameId}
          >
            {copiedGameId ? '✓' : gameId}
          </div>
        )}
        
        <button 
          className="bg-transparent border-0 text-xl text-primary cursor-pointer p-2 rounded hover:bg-secondary transition-colors"
          onClick={handleMenuToggle}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full right-4 bg-white border border-gray-300 rounded shadow-lg min-w-200 z-dropdown">
          {gameId && (
            <button 
              className="w-full p-3 px-4 border-0 bg-transparent text-left cursor-pointer hover:bg-secondary transition-colors text-sm text-primary"
              onClick={handleCopyGameId}
            >
              📋 Copy Game ID
            </button>
          )}
          <button 
            className="w-full p-3 px-4 border-0 bg-transparent text-left cursor-pointer hover:bg-secondary transition-colors text-sm text-primary"
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