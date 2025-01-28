import React from 'react';
import { Loading } from '@/shared/components/Loading';
import styles from './CashierView.module.css';

const CashierView = () => {
  // Future cashier-specific state management
  const [isLoading] = React.useState(false);

  // Future cashier-specific effects
  // React.useEffect(() => {
  //   // Initialize balance, fetch transaction history, etc.
  // }, []);

  return (
    <div className={styles.cashierView}>
      {isLoading ? (
        <Loading size="lg" text="Loading financial data..." />
      ) : (
        <p>Cashier page under development</p>
      )}
    </div>
  );
};

export default CashierView;
