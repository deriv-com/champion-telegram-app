import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { useTelegram, useAuth } from '@/hooks';
import { APP_CONFIG } from '@/config/app.config';
import { ShimmerLoading } from '@/shared/components/Loading';
import styles from './AppBar.module.css';

const ChevronIcon = ({ className }) => (
  <svg 
    className={className} 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    data-testid="chevron-icon"
  >
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

const AppBar = ({ accountId, balance = '0.00', currency = 'USD' }) => {
  console.log('AppBar props:', { accountId, balance, currency });
  const navigate = useNavigate();
  const { webApp, showConfirm } = useTelegram();
  const { logout, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const accountRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      // In development mode, skip confirmation
      const confirmed = APP_CONFIG.environment.isDevelopment ? true : await showConfirm('Are you sure you want to logout?');
      if (!confirmed) return;

      // Close dropdown immediately to prevent UI glitches
      setIsDropdownOpen(false);

      // Small delay to allow dropdown animation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Perform logout and wait for it to complete
      const success = await logout();
      
      // If logout failed, show error
      if (!success) {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <div className={styles.appBar}>
        <div className={styles.leading}>
          <img 
            src="/champion-short-logo.svg" 
            alt="Champion Logo" 
            className={styles.logo}
          />
        </div>
        <div className={styles.trailing}>
          <div 
            ref={accountRef}
            className={`${styles.accountInfo} ${isDropdownOpen ? styles.active : ''}`} 
            onClick={toggleDropdown}
            data-testid="account-info"
          >
            {isLoading ? (
              <div className={styles.accountDetails}>
                <ShimmerLoading 
                  lines={[
                    { width: '100px', height: '16px', style: { marginBottom: '2px' } }, // Account ID
                    { width: '140px', height: '16px' }  // Balance with currency
                  ]}
                  gap={4}
                  shape="rounded"
                  containerStyle={{ alignItems: 'flex-end' }}
                />
              </div>
            ) : (
              <div className={styles.accountDetails} data-testid="account-details">
                <span className={styles.accountId} data-testid="account-id">{accountId}</span>
                <span className={styles.balance} data-testid="balance">{currency} {balance}</span>
              </div>
            )}
            <ChevronIcon className={`${styles.chevron} ${isDropdownOpen ? styles.rotated : ''}`} />
          </div>
        </div>
      </div>
      <div 
        ref={dropdownRef}
        className={`${styles.dropdown} ${isDropdownOpen ? styles.show : ''}`}
        data-testid="dropdown"
      >
        <div className={styles.dropdownItem}>Account Details</div>
        <div className={styles.dropdownItem}>Settings</div>
        <div 
          className={`${styles.dropdownItem} ${styles.logout}`}
          onClick={handleLogout}
          data-testid="logout-button"
        >
          Logout
        </div>
      </div>
    </>
  );
};

export default AppBar;
