import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import BottomSheet from '@/shared/components/BottomSheet';
import { chevronDownIcon } from '@/assets/images';
import StakeSelector from './StakeSelector/StakeSelector';
import styles from './StakeField.module.css';

const StakeField = ({ value, onChange, disabled, balance }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value === 0 ? '' : value);
  const isExceedingBalance = balance !== null && value > balance;

  const handleSubmit = useCallback(() => {
    onChange(tempValue);
    setIsOpen(false);
  }, [onChange, tempValue]);

  const handleClose = useCallback(() => {
    setTempValue(value === 0 ? '' : value);
    setIsOpen(false);
  }, [value]);

  return (
    <div className={styles.wrapper}>
      <div 
        className={`card-view ${styles.container}`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        <div className={styles.fieldContent}>
          <div className={styles.textContent}>
            <span className={`card-view-label ${styles.label}`}>Stake</span>
            <span className={`card-view-value ${styles.value}`}>
              USD {typeof value === 'number' && value > 0 ? value.toFixed(2) : '0.00'}
            </span>
          </div>
          <img src={chevronDownIcon} alt="select" className={styles.chevron} />
        </div>
      </div>
      
      {balance !== null && (
        <div className={styles.balanceContainer}>
          <span className={styles.balance}>
            Balance: USD {balance.toFixed(2)}
          </span>
        </div>
      )}
      
      {isExceedingBalance && (
        <span className={styles.errorText}>
          Stake exceeds available balance
        </span>
      )}

      <BottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        title="Select Stake Amount"
      >
        <StakeSelector
          value={tempValue}
          onChange={setTempValue}
          onSubmit={handleSubmit}
          balance={balance}
        />
      </BottomSheet>
    </div>
  );
};

StakeField.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  balance: PropTypes.number
};

export default StakeField;
