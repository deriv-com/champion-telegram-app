import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './MarketSelector.module.css';
import Modal from '@/shared/components/Modal';
import { chevronDownIcon } from '@/assets/images';

const MarketSelector = ({ activeSymbols, onMarketChange, defaultMarket, disabled = false }) => {
  const [selectedMarket, setSelectedMarket] = useState(() => {
    if (!activeSymbols?.length) return '';
    if (defaultMarket && activeSymbols.some(market => market.symbol === defaultMarket)) {
      return defaultMarket;
    }
    return activeSymbols[0].symbol;
  });

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMarkets = activeSymbols.filter(market => 
    market.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarketSelect = useCallback((market) => {
    setSelectedMarket(market.symbol);
    onMarketChange?.(market.symbol);
    setShowModal(false);
    setSearchQuery('');
  }, [onMarketChange]);

  const selectedMarketName = activeSymbols?.find(m => m.symbol === selectedMarket)?.display_name || selectedMarket;

  if (!activeSymbols?.length) {
    return (
      <div className={styles.error}>
        No markets available
      </div>
    );
  }

  return (
    <div className={`card-view ${styles.container} ${disabled ? styles.disabled : ''}`}>
      <div 
        className={styles.fieldContent}
        onClick={() => !disabled && setShowModal(true)}
      >
        <div className={styles.textContent}>
          <span className={`card-view-label ${styles.label}`}>Select Market</span>
          <span className={`card-view-value ${styles.value}`}>{selectedMarketName}</span>
        </div>
        <img 
          src={chevronDownIcon} 
          alt="select" 
          className={styles.chevron} 
        />
      </div>
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSearchQuery('');
        }}
        title="Select Market"
      >
        <div className={styles.modalContent}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.target.blur();
                }
              }}
            />
            {searchQuery && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchQuery('')}
                type="button"
                aria-label="Clear search"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          <div className={styles.marketList}>
            {filteredMarkets.length === 0 ? (
              <div className={styles.noResults}>
                No markets found
              </div>
            ) : (
              filteredMarkets.map((market) => (
                <button
                  key={market.symbol}
                  className={`${styles.option} ${market.symbol === selectedMarket ? styles.selected : ''}`}
                  onClick={() => handleMarketSelect(market)}
                >
                  {market.display_name || market.symbol}
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
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
