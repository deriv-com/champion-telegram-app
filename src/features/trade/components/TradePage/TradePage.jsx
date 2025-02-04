import React, { memo, useState } from 'react';
import { ShimmerLoading } from '@/shared/components/Loading';
import TradeButton from '../TradeButton';
import MarketSelector from '../MarketSelector';
import LiveQuote from '../LiveQuote';
import DurationInput from '../DurationInput';
import StakeInput from '../StakeInput';
import DigitPrediction from '../DigitPrediction';
import { useTrade } from '../../hooks/useTrade';
import { useNotification } from '@/hooks/useNotification';
import { useTelegram } from '@/hooks/useTelegram';
import styles from './TradePage.module.css';

const TradePage = () => {
  const { activeSymbols, isLoading } = useTrade();
  const { info } = useNotification();
  const { haptic } = useTelegram();
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
        <TradeButton
          variant="positive"
          label="Matches"
          payoutAmount="$25.50"
          onClick={() => {
            // Demo notification - actual trade implementation will come later
            const marketName = selectedMarket && typeof selectedMarket === 'object' ? selectedMarket.display_name : 'Unknown';
            info(`🎯 Trade Placed Successfully!\n💰 Stake: $${stake}\n🎲 Trade: Matches ${selectedDigit}\n📊 Market: ${marketName}`, { usePopup: true });
          }}
          disabled={selectedDigit === null || selectedDigit === undefined}
        />
        <TradeButton
          variant="negative"
          label="Differs"
          payoutAmount="$25.50"
          onClick={() => {
            // Demo notification - actual trade implementation will come later
            const marketName = selectedMarket && typeof selectedMarket === 'object' ? selectedMarket.display_name : 'Unknown';
            info(`🎯 Trade Placed Successfully!\n💰 Stake: $${stake}\n🎲 Trade: Differs ${selectedDigit}\n📊 Market: ${marketName}`, { usePopup: true });
          }}
          disabled={selectedDigit === null || selectedDigit === undefined}
        />
      </div>
    </div>
  );
};

export default memo(TradePage);
