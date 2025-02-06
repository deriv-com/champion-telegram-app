import React, { createContext, useContext, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import Toast from '../shared/components/Toast/Toast';

/**
 * @typedef {Object} ToastOptions
 * @property {string} message - The message to display
 * @property {('info'|'success'|'error'|'warning')} [type='info'] - Toast type
 * @property {('top'|'bottom')} [position='top'] - Toast position
 * @property {number} [duration=3000] - Auto-close duration in ms (0 for no auto-close)
 * @property {React.ReactNode} [icon] - Custom icon
 * @property {{ label: string, onClick: Function }} [action] - Action button config
 */

/**
 * @typedef {Object} ToastContextValue
 * @property {(options: ToastOptions) => number} showToast - Function to show a toast
 * @property {(id: number) => void} removeToast - Function to remove a toast
 */

/** @type {React.Context<ToastContextValue>} */
const ToastContext = createContext(null);

// Action types
const ADD_TOAST = 'ADD_TOAST';
const REMOVE_TOAST = 'REMOVE_TOAST';

/**
 * Reducer for managing toast state
 * @param {Array} state - Current toasts array
 * @param {{ type: string, toast?: Object, id?: number }} action - Reducer action
 * @returns {Array} New state
 */
const toastReducer = (state, action) => {
  switch (action.type) {
    case ADD_TOAST:
      return [...state, action.toast];
    case REMOVE_TOAST:
      return state.filter(toast => toast.id !== action.id);
    default:
      return state;
  }
};

/**
 * Provider component for toast notifications
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {number} [props.maxToasts=3] - Maximum number of toasts to show at once
 */
export const ToastProvider = ({ children, maxToasts = 3 }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    dispatch({
      type: ADD_TOAST,
      toast: { ...toast, id }
    });

    // Remove oldest toast if we exceed maxToasts
    if (toasts.length >= maxToasts) {
      dispatch({ type: REMOVE_TOAST, id: toasts[0].id });
    }

    return id;
  }, [toasts, maxToasts]);

  const removeToast = useCallback((id) => {
    dispatch({ type: REMOVE_TOAST, id });
  }, []);

  const showToast = useCallback(({
    message,
    type = 'info',
    position = 'top',
    duration = 3000,
    icon,
    action
  }) => {
    return addToast({
      message,
      type,
      position,
      duration,
      icon,
      action
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div 
        className="toast-container" 
        data-position="top"
        aria-live="polite"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
  maxToasts: PropTypes.number,
};

/**
 * Hook for using toast notifications
 * @returns {ToastContextValue} Toast context value
 * @throws {Error} If used outside of ToastProvider
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
