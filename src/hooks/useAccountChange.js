import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to handle account changes in components.
 * @param {Function} onAccountChange - Callback function to execute when account changes
 * @returns {Object} Object containing loading states and current account info
 * 
 * Example usage:
 * ```jsx
 * const TradeView = () => {
 *   const { isChanging, defaultAccount } = useAccountChange(async () => {
 *     // Reload trade data for new account
 *     await loadTradeData();
 *   });
 * 
 *   if (isChanging) {
 *     return <LoadingComponent />;
 *   }
 * 
 *   return <TradeContent />;
 * };
 * ```
 */
export const useAccountChange = (onAccountChange) => {
  const { 
    defaultAccount, 
    isSwitchingAccount, 
    ACCOUNT_CHANGE_EVENT 
  } = useAuth();

  const handleAccountChange = useCallback(async () => {
    if (onAccountChange) {
      try {
        await onAccountChange();
      } catch (error) {
        console.error('Error handling account change:', error);
      }
    }
  }, [onAccountChange]);

  useEffect(() => {
    // Listen for account changes
    window.addEventListener(ACCOUNT_CHANGE_EVENT, handleAccountChange);
    
    return () => {
      window.removeEventListener(ACCOUNT_CHANGE_EVENT, handleAccountChange);
    };
  }, [ACCOUNT_CHANGE_EVENT, handleAccountChange]);

  return {
    isChanging: isSwitchingAccount,
    defaultAccount
  };
};
