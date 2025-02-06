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
          {!selectedDigit && !isTrading && (
            <small className={styles.infoText}>Select any digit to start trading</small>
          )}
        </span>
      </div>

      <div className={styles.digitGrid}>
        {digits.map((digit) => (
          <button
            key={digit}
            onClick={isTrading ? (undefined) : () => {
              haptic.impact();
              onDigitSelect(digit);
            }}
            className={`${styles.digitButton} ${selectedDigit === digit ? styles.selected : ''} ${currentDigit === digit ? styles.highlight : ''}`}
            style={currentDigit === digit ? {
              '--highlight-color': contractType === 'DIGITMATCH' ? 'var(--color-trade-button-positive)' : 'var(--color-trade-button-negative)',
              '--highlight-color-rgba': contractType === 'DIGITMATCH' ? 'rgba(3, 195, 144, 0.4)' : 'rgba(223, 0, 64, 0.4)'
            } : undefined}
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
