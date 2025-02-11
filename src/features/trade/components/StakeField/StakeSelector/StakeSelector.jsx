import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useStakeConfig } from '../../../hooks/useStakeConfig';
import styles from './StakeSelector.module.css';

const StakeSelector = ({ value, onChange, onSubmit, balance }) => {
  const { minStake, maxStake, suggestedStakes, validateStake, calculatePayouts } = useStakeConfig();
  const [inputValue, setInputValue] = useState(value === 0 ? '' : value.toString());
  const [error, setError] = useState('');

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setInputValue(val);
    setError(validateStake(val));
    
    // Only update parent if value is valid
    if (!validateStake(val)) {
      onChange(parseFloat(val) || 0);
    }
  }, [onChange, validateStake]);

  const handleIncrement = useCallback(() => {
    const currentVal = parseFloat(inputValue);
    const newValue = isNaN(currentVal) || currentVal >= maxStake ? minStake : 
      Math.min(maxStake, currentVal + (currentVal < 100 ? 1 : 10));
    setInputValue(newValue.toString());
    setError('');
    onChange(newValue);
  }, [inputValue, maxStake, minStake, onChange]);

  const handleDecrement = useCallback(() => {
    const currentVal = parseFloat(inputValue);
    const newValue = isNaN(currentVal) || currentVal <= minStake ? maxStake :
      Math.max(minStake, currentVal - (currentVal <= 100 ? 1 : 10));
    setInputValue(newValue.toString());
    setError('');
    onChange(newValue);
  }, [inputValue, maxStake, minStake, onChange]);

  const handleSubmit = useCallback(() => {
    if (!error && inputValue !== '') {
      const numVal = parseFloat(inputValue);
      if (!isNaN(numVal)) {
        onSubmit(numVal);
      }
    }
  }, [error, inputValue, onSubmit]);

  useEffect(() => {
    setInputValue(value === 0 ? '' : value.toString());
    setError('');
  }, [value]);

  const payouts = calculatePayouts(inputValue);
  const isExceedingBalance = balance !== null && parseFloat(inputValue) > balance;
  const numericValue = parseFloat(inputValue);
  const isValid = !error && !isNaN(numericValue) && inputValue !== '';

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <button
          className={styles.controlButton}
          onClick={handleDecrement}
          disabled={!isValid || numericValue <= minStake}
          type="button"
          aria-label="Decrease amount"
        >
          −
        </button>
        <div className={styles.inputContainer}>
          <span className={styles.currencySymbol}>USD</span>
          <input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className={`${styles.input} ${error ? styles.error : ''}`}
            placeholder="0.00"
          />
        </div>
        <button
          className={styles.controlButton}
          onClick={handleIncrement}
          disabled={!isValid || numericValue >= maxStake}
          type="button"
          aria-label="Increase amount"
        >
          +
        </button>
      </div>
      {error && <div className={styles.errorText}>{error}</div>}
      {isExceedingBalance && (
        <div className={styles.errorText}>Stake exceeds available balance</div>
      )}

      <div className={styles.quickAmounts}>
        {suggestedStakes.map((amount) => (
          <button
            key={amount}
            className={`${styles.quickAmount} ${parseFloat(inputValue) === amount ? styles.selected : ''}`}
            onClick={() => {
              setInputValue(amount.toString());
              setError('');
              onChange(amount);
            }}
            type="button"
          >
            USD {amount}
          </button>
        ))}
      </div>

      {balance !== null && (
        <div className={styles.balanceInfo}>
          <span className={styles.balanceLabel}>Balance:</span>
          <span className={styles.balanceValue}>USD {balance.toFixed(2)}</span>
        </div>
      )}

      <div className={styles.payoutInfo}>
        <div className={styles.payoutRow}>
          <span className={styles.payoutLabel}>Max Payout:</span>
          <span className={styles.payoutValue}>USD {payouts.maxPayout}</span>
        </div>
        <div className={styles.payoutRow}>
          <span className={styles.payoutLabel}>Payout (Matches):</span>
          <span className={styles.payoutValue}>USD {payouts.matchPayout}</span>
        </div>
        <div className={styles.payoutRow}>
          <span className={styles.payoutLabel}>Payout (Differs):</span>
          <span className={styles.payoutValue}>USD {payouts.differPayout}</span>
        </div>
      </div>

      <button 
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={!isValid || isExceedingBalance}
        type="button"
      >
        Submit
      </button>
    </div>
  );
};

StakeSelector.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  balance: PropTypes.number
};

export default StakeSelector;
