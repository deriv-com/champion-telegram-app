import React from 'react';
import { useAccountChange } from '@/hooks/useAccountChange';
import { ShimmerLoading } from '@/shared/components/Loading';
import styles from './PositionsView.module.css';

const PositionsView = () => {
  const { isChanging } = useAccountChange(async () => {
    // Example: Reload positions data when account changes
    // await positionsService.loadPositions(defaultAccount.account);
    // await loadOrders();
    // etc.
  });

  if (isChanging) {
    return (
      <div className={styles.loadingContainer}>
        <ShimmerLoading 
          lines={[
            { width: '100%', height: '60px', repeat: 3 }
          ]}
          gap={12}
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
      Positions page under development
    </div>
  );
};

export default PositionsView;
