import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/shared/components';
import styles from './TradeButton.module.css';

const TradeButton = ({ 
  variant = 'positive',
  children,
  onClick,
  ...props 
}) => {
  const buttonClass = variant === 'positive' ? styles.buttonPositive : styles.buttonNegative;

  return (
    <Button
      className={buttonClass}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
};

TradeButton.propTypes = {
  variant: PropTypes.oneOf(['positive', 'negative']),
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
};

export default TradeButton;
