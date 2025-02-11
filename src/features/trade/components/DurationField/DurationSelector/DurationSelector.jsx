import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './DurationSelector.module.css';

const DurationSelector = ({ value, onSubmit }) => {
  const min = 1;
  const max = 10;
  const [inputValue, setInputValue] = useState(value.toString());
  const [error, setError] = useState('');

  const validate = (val) => {
    const numVal = parseInt(val);
    
    if (isNaN(numVal)) {
      return 'Please enter a valid number';
    }
    if (numVal < min) {
      return `Minimum duration is ${min} tick`;
    }
    if (numVal > max) {
      return `Maximum duration is ${max} ticks`;
    }
    return '';
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setError(validate(val));
  };

  const handleIncrement = () => {
    const currentVal = parseInt(inputValue);
    let newValue;
    
    if (isNaN(currentVal) || currentVal >= max) {
      newValue = min;
    } else {
      newValue = currentVal + 1;
    }
    
    setInputValue(newValue.toString());
    setError('');
  };

  const handleDecrement = () => {
    const currentVal = parseInt(inputValue);
    let newValue;
    
    if (isNaN(currentVal) || currentVal <= min) {
      newValue = max;
    } else {
      newValue = currentVal - 1;
    }
    
    setInputValue(newValue.toString());
    setError('');
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.toString());
    setError('');
  };

  const handleSubmit = () => {
    const numVal = parseInt(inputValue);
    if (!error && numVal !== value) {
      onSubmit(numVal);
    }
  };

  useEffect(() => {
    setInputValue(value.toString());
    setError('');
  }, [value]);

  const suggestions = [1, 2, 3, 5, 7, 10];
  const numericValue = parseInt(inputValue);
  const isValid = !error && !isNaN(numericValue);

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <button
          className={styles.controlButton}
          onClick={handleDecrement}
          disabled={isValid && numericValue <= min}
          type="button"
        >
          -
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={inputValue}
          onChange={handleInputChange}
          className={`${styles.input} ${error ? styles.error : ''}`}
          autoFocus={false}
        />
        <button
          className={styles.controlButton}
          onClick={handleIncrement}
          disabled={isValid && numericValue >= max}
          type="button"
        >
          +
        </button>
      </div>

      {error && <div className={styles.errorText}>{error}</div>}

      <div className={styles.suggestions}>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            className={`${styles.suggestion} ${value === suggestion ? styles.selected : ''}`}
            onClick={() => handleSuggestionClick(suggestion)}
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

export default DurationSelector;
