import React, { memo, useState } from 'react';
import { ShimmerLoading } from '@/shared/components/Loading';
import TradeButton from '../TradeButton';
import MarketSelector from '../MarketSelector';
import LiveQuote from '../LiveQuote';
import DurationField from '../DurationField';
import StakeField from '../StakeField';
import DigitPrediction from '../DigitPrediction';
import { useTrade } from '../../hooks/useTrade';
import { useNotification } from '@/hooks/useNotification';
import { useTelegram } from '@/hooks/useTelegram';
import styles from './TradePage.module.css';

const TradePage = () => {
  const { activeSymbols, isLoading } = useTrade();
  const [currentDigit, setCurrentDigit] = useState();
  const { info } = useNotification();
  const { haptic } = useTelegram();
  const [duration, setDuration] = useState(1);
  const [stake, setStake] = useState(0);
  const handleDigitSelect = (digit) => {
    setSelectedDigit(digit);
  };
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [isTrading, setIsTrading] = useState(false);

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
        <div className={styles.tradeParameters}>
          <DurationField
            value={duration}
            onChange={setDuration}
          />
          <StakeField
            value={stake}
            onChange={setStake}
            disabled={false}
            balance={null}
          />
        </div>
      )}
      {!isLoading && (
        <div className={styles.tradeConfigWrapper}>
          <LiveQuote
            isDigitsTradeType={true}
            price="1.23456"
            movement="up"
            onLastDigitChange={(digit) => {
              const numDigit = parseInt(digit);
              if (!isNaN(numDigit)) {
                setCurrentDigit(numDigit);
              }
            }}
          />
        </div>
      )}
      {!isLoading && (
        <div className={styles.digitPredictionWrapper}>
          <DigitPrediction
            currentDigit={currentDigit}
            selectedDigit={selectedDigit}
            onDigitSelect={handleDigitSelect}
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
            setIsTrading(true);
            info(`🎯 Trade Placed Successfully!\n💰 Stake: $${stake}\n🎲 Trade: Matches ${selectedDigit}\n📊 Market: ${marketName}`);
            // Simulate trade completion after 5 seconds
            setTimeout(() => setIsTrading(false), 5000);
          }}
          disabled={selectedDigit === null || selectedDigit === undefined}
          selectedDigit={selectedDigit}
          isTrading={isTrading}
        />
        <TradeButton
          variant="negative"
          label="Differs"
          payoutAmount="$25.50"
          onClick={() => {
            // Demo notification - actual trade implementation will come later
            const marketName = selectedMarket && typeof selectedMarket === 'object' ? selectedMarket.display_name : 'Unknown';
            setIsTrading(true);
            info(`🎯 Trade Placed Successfully!\n💰 Stake: $${stake}\n🎲 Trade: Differs ${selectedDigit}\n📊 Market: ${marketName}`);
            // Simulate trade completion after 5 seconds
            setTimeout(() => setIsTrading(false), 5000);
          }}
          disabled={selectedDigit === null || selectedDigit === undefined}
          selectedDigit={selectedDigit}
          isTrading={isTrading}
        />
      </div>
    </div>
  );
};

export default memo(TradePage);
