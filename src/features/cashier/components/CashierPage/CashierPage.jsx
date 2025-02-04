import React from 'react';
import styles from './CashierPage.module.css';

const CashierPage = () => {
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

export default CashierPage;
