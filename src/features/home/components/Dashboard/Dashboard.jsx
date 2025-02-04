import React, { useState, useMemo } from 'react';
import { Loading } from '@/shared/components';
import styles from './Dashboard.module.css';
import { tradeIcon, cashierIcon, positionsIcon } from '@/assets/images';
import { TabBar, AppBar } from '@/shared/components';
import { useAuth } from '@/hooks';
import { TradePage } from '@/features/trade';
import { CashierPage } from '@/features/cashier';
import { PositionsPage } from '@/features/positions';

const TAB_ITEMS = [
  {
    id: 'trade',
    icon: tradeIcon,
    label: 'Trade'
  },
  {
    id: 'cashier',
    icon: cashierIcon,
    label: 'Cashier'
  },
  {
    id: 'positions',
    icon: positionsIcon,
    label: 'Positions'
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('trade');
  const { accountId, isLoading } = useAuth();

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'trade':
        return <TradePage />;
      case 'cashier':
        return <CashierPage />;
      case 'positions':
        return <PositionsPage />;
      default:
        return null;
    }
  }, [activeTab]);

  // Show loading only during initial load
  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <Loading size="lg" text="Loading your account..." />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <AppBar accountId={accountId} />
      <div className={styles.content}>
        {tabContent}
      </div>
      <TabBar
        items={TAB_ITEMS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Dashboard;
