import React from 'react';
import { haptic } from '@/utils/telegram';
import styles from './DigitPrediction.module.css';

const DigitPrediction = ({
  currentDigit,
  selectedDigit,
  onDigitSelect,
  contractType,
  isTrading,
  duration,
  remainingTicks
}) => {
  const digits = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>
          Last Digit Prediction
        </span>
        {currentDigit !== null && (
          <span className={styles.currentDigit}>
            Current: <strong>{currentDigit}</strong>
          </span>
        )}
      </div>

      <div className={styles.digitGrid}>
        {digits.map((digit) => (
          <button
            key={digit}
            onClick={() => {
              if (!isTrading) {
                haptic.impact();
                onDigitSelect(digit);
              }
            }}
            className={`${styles.digitButton}
              ${currentDigit === digit ? styles.highlight : ''}
              ${selectedDigit === digit ? styles.selected : ''}
              ${isTrading ? styles.disabled : ''}`
            }
            disabled={isTrading}
          >
            {digit}
          </button>
        ))}
      </div>

      {isTrading && duration > 0 && (
        <div className={styles.tickCounter}>
          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{
                width: `${((duration - remainingTicks) / duration) * 100}%`
              }}
            />
          </div>
          <span className={styles.tickText}>
            {remainingTicks} ticks remaining
          </span>
        </div>
      )}
    </div>
  );
};

export default DigitPrediction;
