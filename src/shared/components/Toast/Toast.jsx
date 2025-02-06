import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Toast.module.css';

/**
 * Toast notification component that displays messages with different types and styles.
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the toast
 * @param {string} props.message - Message to display in the toast
 * @param {('info'|'success'|'error'|'warning')} [props.type='info'] - Type of toast notification
 * @param {('top'|'bottom')} [props.position='top'] - Position of the toast on the screen
 * @param {number} [props.duration=3000] - Duration in milliseconds before auto-closing (0 for no auto-close)
 * @param {Function} props.onClose - Callback function when toast is closed
 * @param {React.ReactNode} [props.icon] - Custom icon to display
 * @param {Object} [props.action] - Action button configuration
 * @param {string} props.action.label - Action button label
 * @param {Function} props.action.onClick - Action button click handler
 */
const Toast = ({
  id,
  message,
  type = 'info',
  position = 'top',
  duration = 3000,
  onClose,
  icon,
  action,
}) => {
  const handleClose = useCallback(() => {
    const toastElement = document.getElementById(`toast-${id}`);
    if (toastElement) {
      toastElement.classList.add(styles.exit);
      setTimeout(() => {
        onClose(id);
      }, 300); // Match animation duration
    }
  }, [id, onClose]);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const renderIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '!';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      id={`toast-${id}`}
      className={`${styles.toast} ${styles[type]} ${styles[position]}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={styles.iconContainer}>
        <span className={styles.icon}>{renderIcon()}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.message}>{message}</div>
        {action && (
          <button 
            onClick={action.onClick} 
            className={styles.actionButton}
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
  position: PropTypes.oneOf(['top', 'bottom']),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  icon: PropTypes.node,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
};

Toast.defaultProps = {
  type: 'info',
  position: 'top',
  duration: 3000,
  icon: null,
  action: null,
};

export default Toast;
