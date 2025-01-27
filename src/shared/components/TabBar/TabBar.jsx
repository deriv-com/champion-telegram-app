import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './TabBar.module.css';

const ERROR_MESSAGES = {
  MISSING_ITEMS: 'TabBar: items prop is required',
  MISSING_ACTIVE_TAB: 'TabBar: activeTab prop is required',
  MISSING_ON_CHANGE: 'TabBar: onTabChange prop is required'
};

const TabBar = ({ items, activeTab, onTabChange }) => {
  if (!items) throw new Error(ERROR_MESSAGES.MISSING_ITEMS);
  if (!activeTab) throw new Error(ERROR_MESSAGES.MISSING_ACTIVE_TAB);
  if (!onTabChange) throw new Error(ERROR_MESSAGES.MISSING_ON_CHANGE);

  // Memoize button width calculation
  const buttonWidth = useMemo(() => `${100 / items.length}%`, [items.length]);

  // Memoize click handler
  const handleTabClick = useCallback((id) => {
    onTabChange(id);
  }, [onTabChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event, id) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTabChange(id);
    }
  }, [onTabChange]);

  return (
    <nav 
      className={styles.tabBar}
      role="tablist"
      aria-label="Navigation tabs"
    >
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={activeTab === item.id}
          aria-controls={`${item.id}-panel`}
          className={`${styles.tabButton} ${activeTab === item.id ? styles.active : ''}`}
          onClick={() => handleTabClick(item.id)}
          onKeyDown={(e) => handleKeyDown(e, item.id)}
          style={{ width: buttonWidth }}
          tabIndex={activeTab === item.id ? 0 : -1}
        >
          <img src={item.icon} alt="" aria-hidden="true" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

TabBar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default TabBar;
