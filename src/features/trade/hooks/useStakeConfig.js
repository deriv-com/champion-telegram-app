import { useMemo } from 'react';

export const useStakeConfig = () => {
  // These values would come from API later
  const minStake = 1;
  const maxStake = 1000;
  const maxPayout = 2000;
  const suggestedStakes = [10, 20, 50, 100, 200, 500];

  const validateStake = (value) => {
    if (value === '') return '';
    
    const numericValue = parseFloat(value);
    
    if (isNaN(numericValue)) {
      return 'Please enter a valid amount';
    }

    if (numericValue < minStake) {
      return `Minimum stake amount is $${minStake}`;
    }

    if (numericValue > maxStake) {
      return `Maximum stake amount is $${maxStake}`;
    }

    return '';
  };

  const calculatePayouts = (stake) => {
    const numericStake = parseFloat(stake) || 0;
    
    // These multipliers would come from API later
    const matchMultiplier = 1.95;
    const differMultiplier = 1.85;

    return {
      maxPayout,
      matchPayout: (numericStake * matchMultiplier).toFixed(2),
      differPayout: (numericStake * differMultiplier).toFixed(2)
    };
  };

  return useMemo(() => ({
    minStake,
    maxStake,
    maxPayout,
    suggestedStakes,
    validateStake,
    calculatePayouts
  }), []);
};
