import React from 'react';
import GameSidebar from './GameSidebar';
import MainContent from './MainContent';
import MobileHeader from './MobileHeader';

const GameLayout = ({ 
  gameId,
  players = [],
  scores = {},
  currentPlayer,
  children,
  onCopyGameId,
  onLeaveGame,
  stickyQuestion = false,
  extraActions = null,
  className = ''
}) => {
  return (
    <div className={`game-layout ${className}`}>
      <MobileHeader
        title="Trivia Game"
        gameId={gameId}
        onCopyGameId={onCopyGameId}
        onLeaveGame={onLeaveGame}
        showGameId={!!gameId}
      />

      <GameSidebar
        gameId={gameId}
        players={players}
        scores={scores}
        currentPlayer={currentPlayer}
        onCopyGameId={onCopyGameId}
        extraActions={extraActions}
      />

      <MainContent 
        hasSidebar={!!gameId}
        stickyQuestion={stickyQuestion}
        maxWidth="lg"
      >
        {children}
      </MainContent>
    </div>
  );
};

export default GameLayout;