import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimationUtils } from '../../utils/animations';

const Notification = ({ 
  type = 'info', 
  message, 
  translationKey,
  translationParams = {},
  icon, 
  duration = 3000, 
  onClose,
  position = 'top-right'
}) => {
  const notificationRef = useRef(null);
  const { t } = useTranslation();

  // Get the display message - either translated or direct
  const displayMessage = translationKey ? t(translationKey, translationParams) : message;

  useEffect(() => {
    if (notificationRef.current) {
      // Enhanced slide in animation with bounce
      AnimationUtils.slideInNotification(notificationRef.current, {
        from: position.includes('right') ? 'right' : 'left',
        duration: 0.6
      });

      // Add a subtle pulse effect for important notifications
      if (type === 'error' || type === 'success') {
        setTimeout(() => {
          if (notificationRef.current) {
            AnimationUtils.interactionFeedback(notificationRef.current, type);
          }
        }, 300);
      }

      // Auto close after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          if (notificationRef.current) {
            AnimationUtils.fadeOut(notificationRef.current, {
              duration: 0.4
            }).then(() => {
              onClose && onClose();
            });
          }
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [duration, onClose, position, type]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'var(--success)',
          color: 'var(--text-inverse)',
          borderColor: 'var(--success)'
        };
      case 'error':
        return {
          backgroundColor: 'var(--error)',
          color: 'var(--text-inverse)',
          borderColor: 'var(--error)'
        };
      case 'warning':
        return {
          backgroundColor: 'var(--warning)',
          color: 'var(--text-inverse)',
          borderColor: 'var(--warning)'
        };
      default:
        return {
          backgroundColor: 'var(--primary)',
          color: 'var(--text-inverse)',
          borderColor: 'var(--primary)'
        };
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      ref={notificationRef}
      style={{
        position: 'fixed',
        top: position.includes('top') ? 'var(--space-4)' : 'auto',
        bottom: position.includes('bottom') ? 'var(--space-4)' : 'auto',
        right: position.includes('right') ? 'var(--space-4)' : 'auto',
        left: position.includes('left') ? 'var(--space-4)' : 'auto',
        zIndex: 'var(--z-toast)',
        minWidth: '300px',
        maxWidth: '400px',
        padding: 'var(--space-4)',
        borderRadius: 'var(--border-radius)',
        border: '2px solid',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        ...getTypeStyles()
      }}
    >
      <div style={{ fontSize: 'var(--text-lg)' }}>
        {icon || getDefaultIcon()}
      </div>
      <div style={{ flex: 1, fontWeight: '500' }}>
        {displayMessage}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: 'var(--text-lg)',
            padding: 'var(--space-1)',
            borderRadius: 'var(--border-radius)',
            opacity: 0.8
          }}
          onMouseEnter={(e) => e.target.style.opacity = 1}
          onMouseLeave={(e) => e.target.style.opacity = 0.8}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Notification;