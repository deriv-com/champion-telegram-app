import React, { memo, useState } from 'react';
import { ShimmerLoading } from '@/shared/components/Loading';
import MarketSelector from '../MarketSelector';
import LiveQuote from '../LiveQuote';
import DurationInput from '../DurationInput';
import StakeInput from '../StakeInput';
import DigitPrediction from '../DigitPrediction';
import { useTrade } from '../../hooks/useTrade';
import { useNotification } from '@/hooks/useNotification';
import { haptic } from '@/utils/telegram';
import styles from './TradePage.module.css';

const TradePage = () => {
  const { activeSymbols, isLoading } = useTrade();
  const { info } = useNotification();
  const [duration, setDuration] = useState(1);
  const [stake, setStake] = useState(0);
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);

  return (
    <div className={styles.container}>
      <div className={styles.marketSelectorWrapper}>
        {isLoading ? (
          <>
            <ShimmerLoading
              lines={[{ width: '100%', height: '80px' }]}
              gap={16}
              shape="rounded"
            />
            <ShimmerLoading
              lines={[{ width: '100%', height: '40px' }]}
              gap={16}
              shape="rounded"
            />
          </>
        ) : (
          <>
            <LiveQuote isDigitsTradeType={true} />
            <MarketSelector
              activeSymbols={activeSymbols}
              onMarketChange={(symbol) => {
                const market = activeSymbols.find(m => m.symbol === symbol);
                setSelectedMarket(market);
              }}
              disabled={false}
            />
          </>
        )}
      </div>
      {!isLoading && (
        <div className={styles.inputRow}>
          <div className={styles.halfWidth}>
            <DurationInput
              value={duration}
              onChange={setDuration}
            />
          </div>
          <div className={styles.halfWidth}>
            <StakeInput
              value={stake}
              onChange={setStake}
              disabled={false}
              balance={null}
            />
          </div>
        </div>
      )}
      {!isLoading && (
        <div className={styles.digitPredictionWrapper}>
          <DigitPrediction
            currentDigit={null}
            selectedDigit={selectedDigit}
            onDigitSelect={setSelectedDigit}
            contractType={null}
            isTrading={false}
            duration={duration}
            remainingTicks={0}
          />
        </div>
      )}
      <div className={styles.tradeButtonsContainer}>
        <button
          className={`${styles.tradeButton} ${styles.positiveButton}`}
          onClick={() => {
            // Demo notification - actual trade implementation will come later
            haptic.impact(); // Haptic feedback for button press
            haptic.notification(); // Haptic feedback for trade placement
            info(`🎯 Trade Placed Successfully!\n💰 Stake: $${stake}\n🎲 Trade: Matches ${selectedDigit}\n📊 Market: ${selectedMarket?.display_name || 'Unknown'}`, { usePopup: true });
          }}
          disabled={selectedDigit === null || selectedDigit === undefined}
        >
          <div className={styles.buttonContent}>
            <span className={styles.buttonLabel}>Matches</span>
            <div className={styles.payoutRow}>
              <span className={styles.payoutLabel}>Payout</span>
              <span className={styles.payoutAmount}>$25.50</span>
            </div>
          </div>
        </button>
        <button
          className={`${styles.tradeButton} ${styles.negativeButton}`}
          onClick={() => {
            // Demo notification - actual trade implementation will come later
            haptic.impact(); // Haptic feedback for button press
            haptic.notification(); // Haptic feedback for trade placement
            info(`🎯 Trade Placed Successfully!\n💰 Stake: $${stake}\n🎲 Trade: Differs ${selectedDigit}\n📊 Market: ${selectedMarket?.display_name || 'Unknown'}`, { usePopup: true });
          }}
          disabled={selectedDigit === null || selectedDigit === undefined}
        >
          <div className={styles.buttonContent}>
            <span className={styles.buttonLabel}>Differs</span>
            <div className={styles.payoutRow}>
              <span className={styles.payoutLabel}>Payout</span>
              <span className={styles.payoutAmount}>$25.50</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default memo(TradePage);
