import React from 'react';
import styles from './ShimmerLoading.module.css';

export const ShimmerLoading = ({ 
  lines = [], 
  gap = 8, 
  shape = 'rounded',
  containerStyle = {},
  className = ''
}) => {
  const shapeClass = {
    rounded: styles.rounded,
    circular: styles.circular,
    square: styles.square
  }[shape];

  // If no lines provided, render a single line shimmer
  if (lines.length === 0) {
    return (
      <div 
        className={`${styles.shimmerContainer} ${shapeClass} ${className}`}
        style={containerStyle}
        data-testid="shimmer-container"
      >
        <div className={styles.shimmer}></div>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.shimmerComplexContainer} ${className}`}
      style={{ gap: `${gap}px`, ...containerStyle }}
      data-testid="shimmer-complex-container"
    >
      {lines.map((line, index) => (
        <div
          key={index}
          className={`${styles.shimmerContainer} ${shapeClass}`}
          style={{ 
            width: line.width || '100%',
            height: line.height || '20px',
            ...line.style
          }}
          data-testid="shimmer-line"
        >
          <div className={styles.shimmer}></div>
        </div>
      ))}
    </div>
  );
};
