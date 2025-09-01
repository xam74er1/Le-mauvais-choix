import React, { useEffect, useRef } from 'react';
import { AnimationUtils } from '../../utils/animations';

const AnimatedTransition = ({ 
  children, 
  type = 'fadeIn', 
  delay = 0, 
  duration,
  stagger = false,
  className = '',
  trigger = true,
  ...props 
}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current || !trigger) return;

    const element = elementRef.current;
    const options = { delay, duration };

    let animation;

    switch (type) {
      case 'fadeIn':
        animation = AnimationUtils.fadeIn(element, options);
        break;
      case 'slideUp':
        animation = AnimationUtils.slideUp(element, options);
        break;
      case 'slideDown':
        animation = AnimationUtils.slideDown(element, options);
        break;
      case 'slideLeft':
        animation = AnimationUtils.slideLeft(element, options);
        break;
      case 'slideRight':
        animation = AnimationUtils.slideRight(element, options);
        break;
      case 'scaleIn':
        animation = AnimationUtils.scaleIn(element, options);
        break;
      case 'bounceIn':
        animation = AnimationUtils.scaleIn(element, { 
          ...options, 
          ease: 'back.out(1.7)' 
        });
        break;
      case 'phaseTransition':
        // Special animation for game phase transitions
        animation = AnimationUtils.phaseTransition(element, options);
        break;
      case 'playerJoin':
        // Animation for when players join the game
        animation = AnimationUtils.playerJoinAnimation(element, options);
        break;
      case 'celebration':
        // Celebration animation for achievements
        animation = AnimationUtils.celebrationAnimation(element, options);
        break;
      case 'stagger':
        if (stagger) {
          const children = element.children;
          animation = AnimationUtils.staggerIn(children, { 
            ...options, 
            stagger: 0.1,
            direction: 'up'
          });
        } else {
          animation = AnimationUtils.fadeIn(element, options);
        }
        break;
      default:
        animation = AnimationUtils.fadeIn(element, options);
    }

    return () => {
      if (animation) {
        animation.kill();
      }
    };
  }, [type, delay, duration, stagger, trigger]);

  return (
    <div ref={elementRef} className={className} {...props}>
      {children}
    </div>
  );
};

export default AnimatedTransition;