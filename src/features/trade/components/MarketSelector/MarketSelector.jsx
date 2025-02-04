import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './MarketSelector.module.css';

/**
 * MarketSelector component for selecting trading markets
 * Displays markets from active symbols API for digit trading
 * 
 * @param {Object} props
 * @param {Array} props.activeSymbols - Array of active trading symbols from the API
 * @param {Function} props.onMarketChange - Callback function when market selection changes
 * @param {string} [props.defaultMarket] - Optional default market to select
 * @param {boolean} [props.disabled] - Whether the selector is disabled
 */
const MarketSelector = ({ activeSymbols, onMarketChange, defaultMarket, disabled = false }) => {
  // Initialize state with default market or first available market
  const [selectedMarket, setSelectedMarket] = useState(() => {
    if (!activeSymbols?.length) return '';
    if (defaultMarket && activeSymbols.some(market => market.symbol === defaultMarket)) {
      return defaultMarket;
    }
    return activeSymbols[0].symbol;
  });

  // Handle market selection change
  const handleMarketChange = useCallback((event) => {
    const newMarket = event.target.value;
    setSelectedMarket(newMarket);
    onMarketChange?.(newMarket);
  }, [onMarketChange]);

  // If no markets are available or loading, render a message
  if (!activeSymbols?.length) {
    return (
      <div className={styles.error}>
        No markets available
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <label htmlFor="market-select" className={styles.label}>
        Select Market
      </label>
      <select
        id="market-select"
        className={styles.select}
        value={selectedMarket}
        onChange={handleMarketChange}
        disabled={disabled}
        aria-label="Select trading market"
        role="combobox"
        aria-expanded="false"
      >
        {activeSymbols.map((market) => (
          <option key={market.symbol} value={market.symbol}>
            {market.display_name || market.symbol}
          </option>
        ))}
      </select>
    </div>
  );
};

MarketSelector.propTypes = {
  activeSymbols: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string.isRequired,
      display_name: PropTypes.string
    })
  ).isRequired,
  onMarketChange: PropTypes.func,
  defaultMarket: PropTypes.string,
  disabled: PropTypes.bool
};

export default MarketSelector;
