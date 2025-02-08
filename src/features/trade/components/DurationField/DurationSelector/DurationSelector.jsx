import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDurationConfig } from '../../../hooks/useDurationConfig';
import styles from './DurationSelector.module.css';

const DurationSelector = ({ value, onSubmit }) => {
  const { minTicks, maxTicks, suggestedTicks, validateDuration } = useDurationConfig();
  const [inputValue, setInputValue] = useState(value.toString());
  const [error, setError] = useState('');

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setInputValue(val);
    setError(validateDuration(val));
  }, [validateDuration]);

  const handleIncrement = useCallback(() => {
    const currentVal = parseInt(inputValue);
    const newValue = isNaN(currentVal) || currentVal >= maxTicks ? minTicks : currentVal + 1;
    setInputValue(newValue.toString());
    setError('');
  }, [inputValue, maxTicks, minTicks]);

  const handleDecrement = useCallback(() => {
    const currentVal = parseInt(inputValue);
    const newValue = isNaN(currentVal) || currentVal <= minTicks ? maxTicks : currentVal - 1;
    setInputValue(newValue.toString());
    setError('');
  }, [inputValue, maxTicks, minTicks]);

  const handleSubmit = useCallback(() => {
    const numVal = parseInt(inputValue);
    if (!error && numVal !== value) {
      onSubmit(numVal);
    }
  }, [error, inputValue, onSubmit, value]);

  useEffect(() => {
    setInputValue(value.toString());
    setError('');
  }, [value]);

  const numericValue = parseInt(inputValue);
  const isValid = !error && !isNaN(numericValue);

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <button
          className={styles.controlButton}
          onClick={handleDecrement}
          disabled={isValid && numericValue <= minTicks}
          type="button"
        >
          -
        </button>
        <input
          type="number"
          min={minTicks}
          max={maxTicks}
          value={inputValue}
          onChange={handleInputChange}
          className={`${styles.input} ${error ? styles.error : ''}`}
          autoFocus={false}
        />
        <button
          className={styles.controlButton}
          onClick={handleIncrement}
          disabled={isValid && numericValue >= maxTicks}
          type="button"
        >
          +
        </button>
      </div>

      {error && <div className={styles.errorText}>{error}</div>}

      <div className={styles.suggestions}>
        {suggestedTicks.map((suggestion) => (
          <button
            key={suggestion}
            className={`${styles.suggestion} ${value === suggestion ? styles.selected : ''}`}
            onClick={() => {
              setInputValue(suggestion.toString());
              setError('');
            }}
            type="button"
          >
            {suggestion} tick{suggestion !== 1 ? 's' : ''}
          </button>
        ))}
      </div>

      <button
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={!isValid || numericValue === value}
        type="button"
      >
        Submit
      </button>
    </div>
  );
};

DurationSelector.propTypes = {
  value: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default React.memo(DurationSelector);
