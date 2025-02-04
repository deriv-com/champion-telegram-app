import React from 'react';
import PropTypes from 'prop-types';
import styles from './LiveQuote.module.css';

const LiveQuote = ({ price = '1.23456', isDigitsTradeType = false, movement = 'up' }) => {
  const digits = price.toString().split('');
  const lastDigitIndex = digits.length - 1;

  return (
    <div className={styles.container}>
      <div className={styles.priceContainer}>
        <div className={styles.label}>Current Price</div>
        <div className={styles.price}>
          {digits.map((digit, index) => (
            <span
              key={`${index}-${digit}`}
              className={`
                ${styles.digit}
                ${index === lastDigitIndex && isDigitsTradeType ? styles.lastDigit : ''}
              `}
            >
              {digit}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.chartContainer}>
        <svg
          width="160"
          height="80"
          viewBox="0 0 160 80"
          className={styles.chart}
        >
          <defs>
            <linearGradient id="gradientUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#03c390" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#03c390" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradientDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#df0040" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#df0040" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Demo data - this would be dynamic with real data */}
          {movement === 'up' ? (
            <>
              <path
                d="M0 60 L20 50 L40 56 L60 40 L80 44 L100 30 L120 20 L140 16 L160 10"
                fill="none"
                stroke="#03c390"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0 60 L20 50 L40 56 L60 40 L80 44 L100 30 L120 20 L140 16 L160 10 V80 H0 Z"
                fill="url(#gradientUp)"
                strokeWidth="0"
              />
              <circle
                cx="160"
                cy="10"
                r="4"
                fill="#03c390"
                filter="url(#glow)"
                className={styles.ticker}
              />
            </>
          ) : (
            <>
              <path
                d="M0 20 L20 30 L40 24 L60 40 L80 36 L100 50 L120 60 L140 64 L160 70"
                fill="none"
                stroke="#df0040"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0 20 L20 30 L40 24 L60 40 L80 36 L100 50 L120 60 L140 64 L160 70 V80 H0 Z"
                fill="url(#gradientDown)"
                strokeWidth="0"
              />
              <circle
                cx="160"
                cy="70"
                r="4"
                fill="#df0040"
                filter="url(#glow)"
                className={styles.ticker}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

LiveQuote.propTypes = {
  price: PropTypes.string,
  isDigitsTradeType: PropTypes.bool,
  movement: PropTypes.oneOf(['up', 'down'])
};

export default LiveQuote;
