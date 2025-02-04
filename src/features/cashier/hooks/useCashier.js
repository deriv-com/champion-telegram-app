import { useState } from 'react';
import { useLoading } from '@/hooks/useLoading';
import { useNotification } from '@/hooks/useNotification';
import websocketService from '@/services/websocket.service';

export const useCashier = () => {
  // Feature-specific state
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Loading and notification hooks
  const { isLoading, withLoading } = useLoading();
  const { showNotification } = useNotification();

  // Feature-specific methods that use cashierApi
  const loadBalance = async () => {
    await withLoading(async () => {
      try {
        const ws = websocketService.instance;
        const response = await ws.api.cashier.getBalance();
        if (response?.balance) {
          setBalance(response.balance);
        }
      } catch (error) {
        showNotification({
          type: 'error',
          message: 'Failed to load balance. Please try again.'
        });
        throw error;
      }
    });
  };

  const loadTransactions = async () => {
    await withLoading(async () => {
      try {
        const ws = websocketService.instance;
        const response = await ws.api.cashier.getTransactionHistory();
        if (response?.statement?.transactions) {
          setTransactions(response.statement.transactions);
        }
      } catch (error) {
        showNotification({
          type: 'error',
          message: 'Failed to load transactions. Please try again.'
        });
        throw error;
      }
    });
  };

  const processDeposit = async (params) => {
    await withLoading(async () => {
      try {
        const ws = websocketService.instance;
        const response = await ws.api.cashier.deposit(params);
        if (response?.cashier?.transaction_id) {
          await loadBalance();
          showNotification({
            type: 'success',
            message: 'Deposit processed successfully'
          });
        }
      } catch (error) {
        showNotification({
          type: 'error',
          message: 'Failed to process deposit. Please try again.'
        });
        throw error;
      }
    });
  };

  const processWithdraw = async (params) => {
    await withLoading(async () => {
      try {
        const ws = websocketService.instance;
        const response = await ws.api.cashier.withdraw(params);
        if (response?.cashier?.transaction_id) {
          await loadBalance();
          showNotification({
            type: 'success',
            message: 'Withdrawal processed successfully'
          });
        }
      } catch (error) {
        showNotification({
          type: 'error',
          message: 'Failed to process withdrawal. Please try again.'
        });
        throw error;
      }
    });
  };

  const refreshCashier = async () => {
    await withLoading(async () => {
      const errors = [];

      try {
        await loadBalance();
      } catch (error) {
        console.error('Failed to load balance:', error);
        errors.push('balance');
      }

      try {
        await loadTransactions();
      } catch (error) {
        console.error('Failed to load transactions:', error);
        errors.push('transactions');
      }

      if (errors.length > 0) {
        showNotification({
          type: 'warning',
          message: `Some operations failed to refresh: ${errors.join(', ')}`
        });
      }
    });
  };

  return {
    // State
    balance,
    transactions,
    isLoading,

    // Methods
    loadBalance,
    loadTransactions,
    processDeposit,
    processWithdraw,
    refreshCashier
  };
};
