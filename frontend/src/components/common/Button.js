import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { AnimationUtils } from '../../utils/animations';

const StyledButton = styled.button`
  /* Enhanced base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-content) var(--space-lg);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-primary);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px; /* Touch target */
  min-width: 44px;
  box-shadow: var(--shadow-xs);
  
  /* Variants */
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: var(--primary);
          color: var(--text-inverse);
          
          &:hover:not(:disabled) {
            background-color: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }
          
          &:active {
            background-color: var(--primary-dark);
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
          }
        `;
      case 'secondary':
        return `
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          
          &:hover:not(:disabled) {
            background-color: var(--bg-tertiary);
            border-color: var(--primary);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }
        `;
      case 'success':
        return `
          background-color: var(--accent-success);
          color: var(--text-inverse);
          
          &:hover:not(:disabled) {
            background-color: var(--accent-success-dark);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }
        `;
      case 'danger':
        return `
          background-color: var(--error);
          color: var(--text-inverse);
          
          &:hover:not(:disabled) {
            background-color: #dc2626;
          }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: var(--primary);
          border: 1px solid var(--primary);
          
          &:hover:not(:disabled) {
            background-color: var(--primary);
            color: var(--text-inverse);
          }
        `;
      default:
        return `
          background-color: var(--primary);
          color: var(--text-inverse);
        `;
    }
  }}
  
  /* Sizes */
  ${props => {
    switch (props.size) {
      case 'sm':
        return `
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-sm);
        `;
      case 'lg':
        return `
          padding: var(--space-4) var(--space-8);
          font-size: var(--text-lg);
        `;
      case 'xl':
        return `
          padding: var(--space-5) var(--space-10);
          font-size: var(--text-xl);
        `;
      default:
        return '';
    }
  }}
  
  /* States */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  /* Full width */
  ${props => props.fullWidth && `
    width: 100%;
  `}
  
  /* Loading state */
  ${props => props.loading && `
    position: relative;
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  animate = true,
  ...props 
}) => {
  const buttonRef = useRef(null);
  const hoverAnimation = useRef(null);

  useEffect(() => {
    if (!animate || !buttonRef.current) return;

    const button = buttonRef.current;
    
    // Create hover animation
    hoverAnimation.current = AnimationUtils.buttonHover(button);

    const handleMouseEnter = () => {
      if (!disabled && !loading) {
        hoverAnimation.current.play();
      }
    };

    const handleMouseLeave = () => {
      if (!disabled && !loading) {
        hoverAnimation.current.reverse();
      }
    };

    const handleClick = (e) => {
      if (!disabled && !loading) {
        // Enhanced click animation with feedback
        AnimationUtils.buttonPress(button);
        AnimationUtils.interactionFeedback(button, 'info', { duration: 0.2 });
        if (onClick) onClick(e);
      }
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('click', handleClick);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      button.removeEventListener('click', handleClick);
      if (hoverAnimation.current) {
        hoverAnimation.current.kill();
      }
    };
  }, [animate, disabled, loading, onClick]);

  return (
    <StyledButton
      ref={buttonRef}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      loading={loading}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;