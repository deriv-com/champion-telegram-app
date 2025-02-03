import React, { useState } from 'react';
import { Loading } from '@/shared/components';
import styles from './Dashboard.module.css';
import { TradeView } from '@/features/trade';
import { CashierView } from '@/features/cashier';
import { PositionsView } from '@/features/positions';
import { tradeIcon, cashierIcon, positionsIcon } from '@/assets/images';
import { TabBar, AppBar } from '@/shared/components';
import { useAuth } from '@/hooks';

const TAB_ITEMS = [
  {
    id: 'trade',
    icon: tradeIcon,
    label: 'Trade',
  },
  {
    id: 'cashier',
    icon: cashierIcon,
    label: 'Cashier',
  },
  {
    id: 'positions',
    icon: positionsIcon,
    label: 'Positions',
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('trade');
  const { accountId, balance, currency, isLoading, isSwitchingAccount } = useAuth();
  console.log('Dashboard auth state:', { 
    accountId, 
    balance, 
    currency, 
    isLoading,
    isSwitchingAccount 
  });

  // Show loading during initial load or account switching
  if (isLoading || isSwitchingAccount) {
    return (
      <div className={styles.dashboard}>
        <Loading size="lg" text="Loading your account..." />
      </div>
    );
  }

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
      <AppBar accountId={accountId} balance={balance} currency={currency} />
      <div className={styles.content}>
        {renderContent()}
      </div>
      <TabBar
        items={TAB_ITEMS}
        activeTab={activeTab}
        onTabChange={(tabId) => {
          // Prevent tab changes during account switching
          if (!isSwitchingAccount) {
            setActiveTab(tabId);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
