import React from 'react';

const MainContent = ({ 
  children, 
  hasSidebar = false,
  maxWidth = 'lg',
  stickyQuestion = false,
  className = '' 
}) => {
  return (
    <main className={`game-main ${className}`}>
      <div className="w-full">
        {children}
      </div>
    </main>
  );
};

export default MainContent;