import React from 'react';
import { Loading } from '@/shared/components/Loading';
import styles from './TradeView.module.css';

const TradeView = () => {
  // Future trade-specific state management
  const [isLoading] = React.useState(false);

  // Future trade-specific effects
  // React.useEffect(() => {
  //   // Initialize trade data, connect to APIs, etc.
  // }, []);

  return (
    <div className={styles.tradeView}>
      {isLoading ? (
        <Loading size="lg" text="Loading markets..." />
      ) : (
        <p>Trade page under development</p>
      )}
    </div>
  );
};

export default TradeView;
