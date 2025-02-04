import React, { memo } from 'react';
import { ShimmerLoading } from '@/shared/components/Loading';
import MarketSelector from '../MarketSelector';
import { useTrade } from '../../hooks/useTrade';
import styles from './TradePage.module.css';

const TradePage = () => {
  const { activeSymbols, isLoading } = useTrade();

  return (
    <div className={styles.container}>
      <div className={styles.marketSelectorWrapper}>
        {isLoading ? (
          <ShimmerLoading 
            lines={[{ width: '100%', height: '40px' }]}
            gap={16}
            shape="rounded"
          />
        ) : (
          <MarketSelector
            activeSymbols={activeSymbols}
            onMarketChange={() => {}}
            disabled={false}
          />
        )}
      </div>
    </div>
  );
};

export default memo(TradePage);
