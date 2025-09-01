import { gsap } from 'gsap';

// Animation configuration
export const animationConfig = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8
  },
  easing: {
    smooth: 'power2.out',
    bounce: 'back.out(1.7)',
    elastic: 'elastic.out(1, 0.3)',
    sharp: 'power3.inOut'
  }
};

// Base animation utilities
export class AnimationUtils {
  // Fade animations
  static fadeIn(element, options = {}) {
    const { duration = animationConfig.duration.normal, delay = 0, ease = animationConfig.easing.smooth } = options;
    
    return gsap.fromTo(element, 
      { opacity: 0 },
      { 
        opacity: 1, 
        duration, 
        delay, 
        ease,
        clearProps: 'all'
      }
    );
  }

  static fadeOut(element, options = {}) {
    const { duration = animationConfig.duration.normal, delay = 0, ease = animationConfig.easing.smooth } = options;
    
    return gsap.to(element, {
      opacity: 0,
      duration,
      delay,
      ease
    });
  }

  // Slide animations
  static slideUp(element, options = {}) {
    const { duration = animationConfig.duration.normal, delay = 0, distance = 30 } = options;
    
    return gsap.fromTo(element,
      { y: distance, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration, 
        delay, 
        ease: animationConfig.easing.smooth,
        clearProps: 'all'
      }
    );
  }

  static slideDown(element, options = {}) {
    const { duration = animationConfig.duration.normal, delay = 0, distance = 30 } = options;
    
    return gsap.fromTo(element,
      { y: -distance, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration, 
        delay, 
        ease: animationConfig.easing.smooth,
        clearProps: 'all'
      }
    );
  }

  static slideLeft(element, options = {}) {
    const { duration = animationConfig.duration.normal, delay = 0, distance = 30 } = options;
    
    return gsap.fromTo(element,
      { x: distance, opacity: 0 },
      { 
        x: 0, 
        opacity: 1, 
        duration, 
        delay, 
        ease: animationConfig.easing.smooth,
        clearProps: 'all'
      }
    );
  }

  static slideRight(element, options = {}) {
    const { duration = animationConfig.duration.normal, delay = 0, distance = 30 } = options;
    
    return gsap.fromTo(element,
      { x: -distance, opacity: 0 },
      { 
        x: 0, 
        opacity: 1, 
        duration, 
        delay, 
        ease: animationConfig.easing.smooth,
        clearProps: 'all'
      }
    );
  }

  // Scale animations
  static scaleIn(element, options = {}) {
    const { duration = animationConfig.duration.normal, delay = 0, scale = 0.8 } = options;
    
    return gsap.fromTo(element,
      { scale, opacity: 0 },
      { 
        scale: 1, 
        opacity: 1, 
        duration, 
        delay, 
        ease: animationConfig.easing.bounce,
        clearProps: 'all'
      }
    );
  }

  static scaleOut(element, options = {}) {
    const { duration = animationConfig.duration.fast, scale = 0.8 } = options;
    
    return gsap.to(element, {
      scale,
      opacity: 0,
      duration,
      ease: animationConfig.easing.sharp
    });
  }

  // Stagger animations for lists
  static staggerIn(elements, options = {}) {
    const { 
      duration = animationConfig.duration.normal, 
      stagger = 0.1, 
      direction = 'up',
      distance = 30 
    } = options;

    const fromProps = { opacity: 0 };
    const toProps = { opacity: 1, duration, ease: animationConfig.easing.smooth, clearProps: 'all' };

    switch (direction) {
      case 'up':
        fromProps.y = distance;
        toProps.y = 0;
        break;
      case 'down':
        fromProps.y = -distance;
        toProps.y = 0;
        break;
      case 'left':
        fromProps.x = distance;
        toProps.x = 0;
        break;
      case 'right':
        fromProps.x = -distance;
        toProps.x = 0;
        break;
      case 'scale':
        fromProps.scale = 0.8;
        toProps.scale = 1;
        break;
      default:
        fromProps.y = distance;
        toProps.y = 0;
        break;
    }

    toProps.stagger = stagger;

    return gsap.fromTo(elements, fromProps, toProps);
  }

  // Button interactions
  static buttonHover(element) {
    const tl = gsap.timeline({ paused: true });
    
    tl.to(element, {
      scale: 1.05,
      duration: animationConfig.duration.fast,
      ease: animationConfig.easing.smooth
    });

    return tl;
  }

  static buttonPress(element) {
    return gsap.to(element, {
      scale: 0.95,
      duration: animationConfig.duration.fast,
      ease: animationConfig.easing.sharp,
      yoyo: true,
      repeat: 1
    });
  }

  // Loading animations
  static pulse(element, options = {}) {
    const { duration = 1, scale = 1.1 } = options;
    
    return gsap.to(element, {
      scale,
      duration,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  static spin(element, options = {}) {
    const { duration = 1 } = options;
    
    return gsap.to(element, {
      rotation: 360,
      duration,
      ease: 'none',
      repeat: -1
    });
  }

  // Page transitions
  static pageTransition(fromElement, toElement, options = {}) {
    const { duration = animationConfig.duration.slow } = options;
    const tl = gsap.timeline();

    // Fade out current page
    tl.to(fromElement, {
      opacity: 0,
      y: -20,
      duration: duration / 2,
      ease: animationConfig.easing.sharp
    });

    // Fade in new page
    tl.fromTo(toElement,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: duration / 2,
        ease: animationConfig.easing.smooth,
        clearProps: 'all'
      }
    );

    return tl;
  }

  // Score animations
  static scoreUpdate(element, newScore, oldScore = 0, options = {}) {
    const { duration = animationConfig.duration.slow } = options;
    const tl = gsap.timeline();
    const scoreIncrease = newScore > oldScore;

    // Animate the number change
    tl.to({ value: oldScore }, {
      value: newScore,
      duration: duration * 0.6,
      ease: 'power2.out',
      onUpdate: function() {
        element.textContent = Math.round(this.targets()[0].value);
      }
    }, 0);

    // Scale up with color change for increases
    if (scoreIncrease) {
      tl.to(element, {
        scale: 1.3,
        color: '#10b981', // Success green
        duration: duration / 3,
        ease: animationConfig.easing.bounce
      }, 0);

      // Hold briefly
      tl.to(element, {
        duration: duration / 3
      });

      // Scale back down
      tl.to(element, {
        scale: 1,
        color: 'inherit',
        duration: duration / 3,
        ease: animationConfig.easing.smooth
      });
    }

    return tl;
  }

  // Enhanced game-specific animations for "Le mauvais choix"
  static phaseTransition(element, options = {}) {
    const { duration = animationConfig.duration.slower } = options;
    const tl = gsap.timeline();

    // Fade out with slight rotation
    tl.to(element, {
      opacity: 0,
      scale: 0.9,
      rotationY: -15,
      duration: duration / 2,
      ease: animationConfig.easing.sharp
    });

    // Fade in with counter-rotation
    tl.to(element, {
      opacity: 1,
      scale: 1,
      rotationY: 0,
      duration: duration / 2,
      ease: animationConfig.easing.bounce
    });

    return tl;
  }

  static playerJoinAnimation(element, options = {}) {
    const { duration = animationConfig.duration.normal } = options;
    const tl = gsap.timeline();

    // Slide in from left with bounce
    tl.fromTo(element,
      { opacity: 0, x: -50, scale: 0.8 },
      { 
        opacity: 1, 
        x: 0, 
        scale: 1, 
        duration, 
        ease: animationConfig.easing.bounce 
      }
    );

    // Add subtle glow effect
    tl.to(element, {
      boxShadow: "0 0 20px rgba(74, 222, 128, 0.5)",
      duration: 0.5,
      yoyo: true,
      repeat: 1
    }, "-=0.3");

    return tl;
  }

  static interactionFeedback(element, type = 'success', options = {}) {
    const { duration = animationConfig.duration.fast } = options;
    
    const colors = {
      success: "#10b981",
      error: "#ef4444", 
      info: "#3b82f6",
      warning: "#f59e0b"
    };

    const tl = gsap.timeline();

    // Quick scale and color flash
    tl.to(element, {
      scale: 1.05,
      backgroundColor: colors[type],
      duration: duration,
      ease: animationConfig.easing.sharp
    });

    tl.to(element, {
      scale: 1,
      backgroundColor: "transparent",
      duration: duration * 1.5,
      ease: animationConfig.easing.smooth
    });

    return tl;
  }

  static celebrationAnimation(element, options = {}) {
    const { duration = animationConfig.duration.slow } = options;
    const tl = gsap.timeline();

    // Bounce and rotate celebration
    tl.to(element, {
      scale: 1.2,
      rotation: 360,
      duration: duration,
      ease: animationConfig.easing.bounce
    });

    // Return to normal
    tl.to(element, {
      scale: 1,
      rotation: 0,
      duration: duration / 2,
      ease: animationConfig.easing.smooth
    });

    return tl;
  }

  static typewriterEffect(element, text, options = {}) {
    const { duration = 0.05 } = options;
    const tl = gsap.timeline();
    
    element.textContent = '';
    
    for (let i = 0; i <= text.length; i++) {
      tl.call(() => {
        element.textContent = text.substring(0, i);
      }, [], i * duration);
    }

    return tl;
  }

  static progressBarAnimation(element, progress, options = {}) {
    const { duration = animationConfig.duration.normal } = options;
    
    return gsap.to(element, {
      width: `${progress}%`,
      duration,
      ease: animationConfig.easing.smooth
    });
  }

  // Notification animations
  static slideInNotification(element, options = {}) {
    const { duration = animationConfig.duration.normal, from = 'right' } = options;
    
    const fromProps = { opacity: 0 };
    const toProps = { 
      opacity: 1, 
      duration, 
      ease: animationConfig.easing.bounce,
      clearProps: 'all'
    };

    if (from === 'right') {
      fromProps.x = 100;
      toProps.x = 0;
    } else if (from === 'left') {
      fromProps.x = -100;
      toProps.x = 0;
    } else if (from === 'top') {
      fromProps.y = -100;
      toProps.y = 0;
    } else if (from === 'bottom') {
      fromProps.y = 100;
      toProps.y = 0;
    }

    return gsap.fromTo(element, fromProps, toProps);
  }

  // Cleanup utility
  static killAll() {
    gsap.killTweensOf('*');
  }

  static killElement(element) {
    gsap.killTweensOf(element);
  }
}

// React hook for GSAP animations
export const useGSAP = () => {
  return AnimationUtils;
};