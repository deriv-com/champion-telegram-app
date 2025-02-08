import { useMemo } from 'react';

export const useDurationConfig = () => {
  // Mock config - will be replaced with API response later
  const config = useMemo(() => ({
    minTicks: 1,
    maxTicks: 10,
    defaultTicks: 5,
    suggestedTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  }), []);

  const validateDuration = (value) => {
    const numValue = parseInt(value);
    
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    if (numValue < config.minTicks) {
      return `Minimum duration is ${config.minTicks} tick`;
    }
    if (numValue > config.maxTicks) {
      return `Maximum duration is ${config.maxTicks} ticks`;
    }
    return '';
  };

  return {
    ...config,
    validateDuration
  };
};
