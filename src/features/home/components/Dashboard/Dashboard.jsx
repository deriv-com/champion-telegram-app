import React from 'react';
import styles from './Dashboard.module.css';
import { TradeView } from '@/features/trade';
import { CashierView } from '@/features/cashier';
import { PositionsView } from '@/features/positions';

const Dashboard = () => {
  const [activeTab, setActiveTab] = React.useState('trade');

  const renderContent = () => {
    switch (activeTab) {
      case 'trade':
        return <TradeView />;
      case 'cashier':
        return <CashierView />;
      case 'positions':
        return <PositionsView />;
      default:
        return <TradeView />;
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.content}>
        {renderContent()}
      </div>
      <nav className={styles.tabBar}>
        <button
          className={`${styles.tabButton} ${activeTab === 'trade' ? styles.active : ''}`}
          onClick={() => setActiveTab('trade')}
        >
          Trade
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'cashier' ? styles.active : ''}`}
          onClick={() => setActiveTab('cashier')}
        >
          Cashier
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'positions' ? styles.active : ''}`}
          onClick={() => setActiveTab('positions')}
        >
          Positions
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;
