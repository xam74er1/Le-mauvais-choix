import React from 'react';

/**
 * ResponsiveContainer - A wrapper component that ensures proper responsive behavior
 * and prevents element overlap while using full available space.
 */
const ResponsiveContainer = ({ 
  children, 
  className = '', 
  layout = 'single', // 'single', 'two-column', 'three-column'
  fullWidth = true,
  noOverlap = true 
}) => {
  const getLayoutClasses = () => {
    const baseClasses = ['responsive-grid'];
    
    if (fullWidth) {
      baseClasses.push('full-width-container');
    }
    
    if (noOverlap) {
      baseClasses.push('no-overlap');
    }
    
    switch (layout) {
      case 'two-column':
        baseClasses.push('two-column');
        break;
      case 'three-column':
        baseClasses.push('three-column');
        break;
      default:
        // Single column layout
        break;
    }
    
    return baseClasses.join(' ');
  };

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;