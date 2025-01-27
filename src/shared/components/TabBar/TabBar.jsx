import React from 'react';
import PropTypes from 'prop-types';
import styles from './TabBar.module.css';

const TabBar = ({ items, activeTab, onTabChange }) => {
  if (!items) {
    throw new Error('TabBar: items prop is required');
  }
  if (!activeTab) {
    throw new Error('TabBar: activeTab prop is required');
  }
  if (!onTabChange) {
    throw new Error('TabBar: onTabChange prop is required');
  }

  return (
    <nav className={styles.tabBar}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`${styles.tabButton} ${activeTab === item.id ? styles.active : ''}`}
          onClick={() => onTabChange(item.id)}
          style={{ width: `${100 / items.length}%` }}
        >
          <img src={item.icon} alt={item.label} />
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
