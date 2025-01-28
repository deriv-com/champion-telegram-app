import { useState } from 'react';
import { useLoading } from '@/hooks/useLoading';
import { useNotification } from '@/hooks/useNotification';
import { tradeApi } from '../api';

export const useTrade = () => {
  // Feature-specific state
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);

  // Loading and notification hooks
  const { isLoading, withLoading } = useLoading();
  const { showNotification } = useNotification();

  // Feature-specific methods that use tradeApi
  const loadMarkets = async () => {
    await withLoading(async () => {
      const data = await tradeApi.getMarkets();
      setMarkets(data);
    });
  };

  const executeTrade = async (params) => {
    const result = await withLoading(async () => {
      return await tradeApi.executeTrade(params);
    });
    
    showNotification({
      type: 'success',
      message: 'Trade executed successfully'
    });
    
    return result;
  };

  const refreshTradeHistory = async () => {
    await withLoading(async () => {
      const history = await tradeApi.getTradeHistory();
      setTradeHistory(history);
    });
  };

  return {
    // State
    markets,
    selectedMarket,
    tradeHistory,
    isLoading,

    // Methods
    loadMarkets,
    executeTrade,
    refreshTradeHistory,
    setSelectedMarket,
  };
};
