import { useState } from 'react';
import { useLoading } from '@/hooks/useLoading';
import { useNotification } from '@/hooks/useNotification';
import { cashierApi } from '../api';

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
      const data = await cashierApi.getBalance();
      setBalance(data.balance);
    });
  };

  const loadTransactions = async () => {
    await withLoading(async () => {
      const data = await cashierApi.getTransactions();
      setTransactions(data);
    });
  };

  const processDeposit = async (amount) => {
    await withLoading(async () => {
      await cashierApi.deposit(amount);
      await loadBalance();
      showNotification({
        type: 'success',
        message: 'Deposit processed successfully'
      });
    });
  };

  const processWithdraw = async (amount) => {
    await withLoading(async () => {
      await cashierApi.withdraw(amount);
      await loadBalance();
      showNotification({
        type: 'success',
        message: 'Withdrawal processed successfully'
      });
    });
  };

  const refreshCashier = async () => {
    await withLoading(async () => {
      await Promise.all([
        loadBalance(),
        loadTransactions()
      ]);
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
