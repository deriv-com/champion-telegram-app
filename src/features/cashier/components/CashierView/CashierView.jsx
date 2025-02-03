import React from 'react';
import { useAccountChange } from '@/hooks/useAccountChange';
import { ShimmerLoading } from '@/shared/components/Loading';
import styles from './CashierView.module.css';

const CashierView = () => {
  const { isChanging } = useAccountChange(async () => {
    // Example: Reload cashier data when account changes
    // await cashierService.loadTransactions(defaultAccount.account);
    // await loadBalances();
    // etc.
  });

  if (isChanging) {
    return (
      <div className={styles.loadingContainer}>
        <ShimmerLoading 
          lines={[
            { width: '100%', height: '100px' },
            { width: '70%', height: '40px' },
            { width: '90%', height: '40px' }
          ]}
          gap={16}
          shape="rounded"
        />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - var(--app-bar-height, 72px))',
      fontSize: '24px',
      fontWeight: '600',
      color: 'var(--color-text-secondary)',
      opacity: '0.8'
    }}>
      Cashier page under development
    </div>
  );
};

export default CashierView;
