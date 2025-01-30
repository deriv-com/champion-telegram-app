import React from 'react';
import { useAccountChange } from '@/hooks/useAccountChange';
import { ShimmerLoading } from '@/shared/components/Loading';
import styles from './TradeView.module.css';

const TradeView = () => {
  const { isChanging } = useAccountChange(async () => {
    // Example: Reload trade data when account changes
    // await tradeService.loadTradeData();
    // await loadPositions();
    // etc.
  });

  if (isChanging) {
    return (
      <div className={styles.loadingContainer}>
        <ShimmerLoading 
          lines={[
            { width: '100%', height: '200px' },
            { width: '60%', height: '40px' },
            { width: '80%', height: '40px' }
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
      Trade page under development
    </div>
  );
};

export default TradeView;
