import React, { useState } from 'react';
import styles from './PositionsPage.module.css';

const mockPositions = {
  open: [
    {
      id: 1,
      market: 'Volatility 100 (1s) Index',
      type: 'MATCHES',
      targetDigit: '3',
      lastDigit: '5',
      ticks: '10',
      ticksLeft: '6',
      profit: 85.50
    },
    {
      id: 2,
      market: 'Jump 100 Index',
      type: 'DIFFERS',
      targetDigit: '3',
      lastDigit: '3',
      ticks: '5',
      ticksLeft: '3',
      profit: -50
    }
  ],
  closed: [
    {
      id: 3,
      market: 'Volatility 75 (1s) Index',
      type: 'MATCHES',
      targetDigit: '7',
      lastDigit: '7',
      ticks: '3',
      profit: 170
    },
    {
      id: 4,
      market: 'Jump 50 Index',
      type: 'DIFFERS',
      targetDigit: '4',
      lastDigit: '4',
      ticks: '5',
      profit: -75
    }
  ]
};

const PositionCard = ({ position, isOpen }) => {
  const profitClass = position.profit > 0 ? styles.profit : styles.loss;
  
  return (
    <div className={styles.positionCard}>
      <div className={styles.cardHeader}>
        <div className={styles.marketName}>{position.market}</div>
        <div className={`${styles.type} ${position.type === 'MATCHES' ? styles.matches : styles.differs}`}>
          {position.type}
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.digitRow}>
          <div className={styles.digitInfo}>
            <span>Target</span>
            <span className={styles.targetDigit}>{position.targetDigit}</span>
          </div>
          <div className={styles.digitInfo}>
            <span>{isOpen ? 'Current' : 'Last'}</span>
            <span className={`${styles.lastDigit} ${
              position.lastDigit === position.targetDigit ? styles.match : ''
            }`}>{position.lastDigit}</span>
          </div>
        </div>
        <div className={styles.ticksRow}>
          <span>Ticks: {position.ticks}</span>
          {isOpen && <span className={styles.ticksLeft}>{position.ticksLeft} left</span>}
        </div>
      </div>
      
      <div className={`${styles.cardFooter} ${profitClass}`}>
        <span>Profit/Loss</span>
        <span>${Math.abs(position.profit).toFixed(2)} {position.profit > 0 ? '↑' : '↓'}</span>
      </div>
    </div>
  );
};

const PositionsPage = () => {
  const [activeTab, setActiveTab] = useState('open');
  
  return (
    <div className={styles.positionsView}>
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'open' ? styles.active : ''}`}
          onClick={() => setActiveTab('open')}
        >
          Open Positions
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'closed' ? styles.active : ''}`}
          onClick={() => setActiveTab('closed')}
        >
          Closed Positions
        </button>
      </div>
      
      <div className={styles.positionsList}>
        {mockPositions[activeTab].map(position => (
          <PositionCard 
            key={position.id} 
            position={position} 
            isOpen={activeTab === 'open'} 
          />
        ))}
      </div>
    </div>
  );
};

export default PositionsPage;
