import React from 'react';

// Responsive breakpoints utility
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// Media query helpers
export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: breakpoints['2xl']}px)`,
  
  // Max width queries
  'max-sm': `(max-width: ${breakpoints.sm - 1}px)`,
  'max-md': `(max-width: ${breakpoints.md - 1}px)`,
  'max-lg': `(max-width: ${breakpoints.lg - 1}px)`,
  'max-xl': `(max-width: ${breakpoints.xl - 1}px)`,
  
  // Touch devices
  touch: '(hover: none) and (pointer: coarse)',
  hover: '(hover: hover) and (pointer: fine)'
};

// Hook for responsive behavior
export const useMediaQuery = (query) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Device detection utilities
export const getDeviceType = () => {
  const width = window.innerWidth;
  
  if (width < breakpoints.sm) return 'mobile';
  if (width < breakpoints.lg) return 'tablet';
  return 'desktop';
};

export const isMobile = () => getDeviceType() === 'mobile';
export const isTablet = () => getDeviceType() === 'tablet';
export const isDesktop = () => getDeviceType() === 'desktop';

// Viewport utilities
export const getViewportSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight
});

export const isLandscape = () => window.innerWidth > window.innerHeight;
export const isPortrait = () => window.innerHeight > window.innerWidth;