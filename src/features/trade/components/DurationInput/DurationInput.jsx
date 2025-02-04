import React from 'react';
import styles from './DurationInput.module.css';

const DurationInput = ({ value, onChange }) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>Duration</label>
      <div className={styles.inputWrapper}>
        <input
          type="number"
          min="1"
          max="10"
          value={value}
          onChange={(e) => {
            const newValue = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 10);
            onChange(newValue);
          }}
          className={styles.input}
        />
        <span className={styles.unit}>tick(s)</span>
      </div>
    </div>
  );
};

export default DurationInput;
