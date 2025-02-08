import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/shared/components';
import styles from './TradeButton.module.css';

const TradeButton = ({ 
  variant = 'positive',
  label,
  payoutAmount,
  onClick,
  disabled,
  selectedDigit,
  ...props 
}) => {
  const buttonClass = variant === 'positive' ? styles.buttonPositive : styles.buttonNegative;

  return (
    <Button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || selectedDigit === undefined || selectedDigit === null}
      {...props}
    >
      <div className={styles.buttonContent}>
        <span className={styles.buttonLabel}>{label}</span>
        <div className={styles.payoutRow}>
          <span className={styles.payoutLabel}>Payout</span>
          <span className={styles.payoutAmount}>{payoutAmount}</span>
        </div>
      </div>
    </Button>
  );
};

TradeButton.propTypes = {
  variant: PropTypes.oneOf(['positive', 'negative']),
  label: PropTypes.string.isRequired,
  payoutAmount: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  selectedDigit: PropTypes.number
};

export default TradeButton;
