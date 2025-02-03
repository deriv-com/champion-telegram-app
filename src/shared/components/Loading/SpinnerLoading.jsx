import React from 'react';
import PropTypes from 'prop-types';
import styles from './SpinnerLoading.module.css';

export const SpinnerLoading = ({ size = 'md', text }) => {
  const sizeClass = {
    sm: styles.small,
    md: styles.medium,
    lg: styles.large
  }[size];

  return (
    <div className={styles.loadingContainer} role="status" aria-live="polite">
      <div className={`${styles.spinner} ${sizeClass}`}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

SpinnerLoading.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  text: PropTypes.string
};
