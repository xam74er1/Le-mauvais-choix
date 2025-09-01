import React from 'react';
import { useGame } from '../context/GameContext';

function ConnectionStatus() {
  const { state } = useGame();

  if (state.connected) {
    return null; // Don't show anything when connected
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#dc3545',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'white',
        animation: 'pulse 1s infinite'
      }} />
      Reconnecting...
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default ConnectionStatus;