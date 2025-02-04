import React from 'react';
import styles from './StakeInput.module.css';

const StakeInput = ({ value, onChange, disabled, balance }) => {
  const isExceedingBalance = balance !== null && value > balance;

  return (
    <div className={styles.container}>
      <div className={styles.labelRow}>
        <label className={styles.label}>Stake</label>
        {balance !== null && (
          <span className={styles.balance}>
            Balance: ${balance.toFixed(2)}
          </span>
        )}
      </div>
      <div className={styles.inputWrapper}>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => {
            const newValue = Math.max(parseFloat(e.target.value) || 0, 0);
            onChange(newValue);
          }}
          className={`${styles.input} ${isExceedingBalance ? styles.error : ''}`}
          disabled={disabled}
        />
        <span className={styles.unit}>$</span>
      </div>
      {isExceedingBalance && (
        <span className={styles.errorText}>
          Stake exceeds available balance
        </span>
      )}
    </div>
  );
};

export default StakeInput;
