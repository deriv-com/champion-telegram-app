import React from 'react';
import PropTypes from 'prop-types';
import { getThemeParams } from '@/services/telegram';
import styles from './RootLayout.module.css';

const RootLayout = ({ children }) => {
  // Get theme parameters from Telegram WebApp
  const themeParams = getThemeParams();

  // Apply theme colors to CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeParams).forEach(([key, value]) => {
      if (key.includes('color')) {
        root.style.setProperty(`--tg-theme-${key}`, value);
      }
    });
  }, [themeParams]);

  return (
    <div className={styles.root}>
      <header role="banner" className={styles.header}>
        {/* Header content */}
      </header>
      <main className={styles.main}>
        {children}
      </main>
      {/* Reserve space for main button if needed */}
      <div className="tg-main-button-area" />
    </div>
  );
};

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RootLayout;
