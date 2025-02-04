import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { useTelegram, useAuth } from '@/hooks';
import { APP_CONFIG } from '@/config/app.config';
import { ShimmerLoading } from '@/shared/components/Loading';
import { authService } from '@/services/auth.service';
import { logoutIcon } from '@/assets/images';
import styles from './AppBar.module.css';

// Move ChevronIcon outside component to prevent recreation
const ChevronIcon = memo(({ className }) => (
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
));

ChevronIcon.propTypes = {
  className: PropTypes.string
};

const AppBar = () => {
  const { showConfirm } = useTelegram();
  const { 
    logout, 
    isLoading, 
    isSwitchingAccount, 
    switchAccount,
    defaultAccount,
    accountId,
    balance,
    currency
  } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tradingAccounts, setTradingAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const dropdownRef = useRef(null);
  const accountRef = useRef(null);

  const loadTradingAccounts = useCallback(async () => {
    try {
      setIsLoadingAccounts(true);
      const accounts = await authService.getTradingAccounts();
      if (accounts) {
        // Filter out the current account
        setTradingAccounts(accounts.filter(acc => acc.account !== defaultAccount?.account));
      }
    } catch (error) {
      console.error('Failed to load trading accounts:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [defaultAccount?.account]);

  // Load accounts initially and when default account changes
  useEffect(() => {
    if (!isLoading) {
      loadTradingAccounts();
    }
  }, [loadTradingAccounts, isLoading, defaultAccount]);

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

  const handleAccountSwitch = async (account) => {
    try {
      const success = await switchAccount(account);
      if (success) {
        setIsDropdownOpen(false);
      }
    } catch (error) {
      console.error('Failed to switch account:', error);
    }
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
          <button 
            ref={accountRef}
            className={`${styles.accountInfo} ${isDropdownOpen ? styles.active : ''}`} 
            onClick={toggleDropdown}
            data-testid="account-info"
            type="button"
          >
            <div className={styles.accountContent}>
              {isLoading || isSwitchingAccount ? (
                <div className={styles.accountDetails}>
                  <ShimmerLoading 
                    lines={[
                      { width: '100px', height: '16px', style: { marginBottom: '2px' } },
                      { width: '140px', height: '16px' }
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
          </button>
        </div>
      </div>
      <div 
        ref={dropdownRef}
        className={`${styles.dropdown} ${isDropdownOpen ? styles.show : ''}`}
        data-testid="dropdown"
      >
        {isLoadingAccounts ? (
          <div className={styles.accountsList}>
            <div className={styles.accountItem}>
              <ShimmerLoading 
                lines={[
                  { width: '80px', height: '16px', style: { marginBottom: '4px' } },
                  { width: '120px', height: '14px' }
                ]}
                gap={4}
                shape="rounded"
              />
            </div>
          </div>
        ) : tradingAccounts.length > 0 ? (
          <div className={styles.accountsList}>
            {tradingAccounts.map((account) => (
              <div
                key={account.account}
                className={`${styles.dropdownItem} ${styles.accountItem}`}
                onClick={() => handleAccountSwitch(account)}
                data-testid={`account-${account.account}`}
              >
                <span className={styles.accountItemCurrency}>{account.currency}</span>
                <span className={styles.accountItemId}>{account.account}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div 
          className={`${styles.dropdownItem} ${styles.logout}`}
          onClick={handleLogout}
          data-testid="logout-button"
        >
          <img src={logoutIcon} alt="" className={styles.logoutIcon} />
          <span>Logout</span>
        </div>
      </div>
    </>
  );
};

export default memo(AppBar);
