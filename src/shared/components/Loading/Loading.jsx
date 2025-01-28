import React from 'react';
import styles from './Loading.module.css';

export const Loading = ({ size = 'md', text }) => {
  const sizeClass = {
    sm: styles.small,
    md: styles.medium,
    lg: styles.large
  }[size];

  return (
    <div className={styles.loadingContainer}>
      <div className={`${styles.spinner} ${sizeClass}`}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};
