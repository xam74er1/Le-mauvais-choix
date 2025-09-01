import React, { useEffect, useRef, useState } from 'react';
import { AnimationUtils } from '../../utils/animations';

const PhaseTransition = ({ 
  currentPhase, 
  children, 
  className = '',
  ...props 
}) => {
  const containerRef = useRef(null);
  const [displayPhase, setDisplayPhase] = useState(currentPhase);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (currentPhase !== displayPhase && !isTransitioning) {
      setIsTransitioning(true);
      
      if (containerRef.current) {
        // Fade out current content
        AnimationUtils.fadeOut(containerRef.current, {
          duration: 0.3
        }).then(() => {
          // Update the phase
          setDisplayPhase(currentPhase);
          
          // Fade in new content
          AnimationUtils.fadeIn(containerRef.current, {
            duration: 0.4,
            delay: 0.1
          }).then(() => {
            setIsTransitioning(false);
          });
        });
      }
    }
  }, [currentPhase, displayPhase, isTransitioning]);

  return (
    <div 
      ref={containerRef} 
      className={`phase-transition-container ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default PhaseTransition;