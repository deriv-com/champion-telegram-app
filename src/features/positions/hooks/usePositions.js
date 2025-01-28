import { useState } from 'react';
import { useLoading } from '@/hooks/useLoading';
import { useNotification } from '@/hooks/useNotification';
import { positionsApi } from '../api';

export const usePositions = () => {
  // Feature-specific state
  const [openPositions, setOpenPositions] = useState([]);
  const [closedPositions, setClosedPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);

  // Loading and notification hooks
  const { isLoading, withLoading } = useLoading();
  const { showNotification } = useNotification();

  // Feature-specific methods that use positionsApi
  const loadOpenPositions = async () => {
    await withLoading(async () => {
      const data = await positionsApi.getOpenPositions();
      setOpenPositions(data);
    });
  };

  const loadClosedPositions = async () => {
    await withLoading(async () => {
      const data = await positionsApi.getClosedPositions();
      setClosedPositions(data);
    });
  };

  const closePosition = async (positionId) => {
    await withLoading(async () => {
      await positionsApi.closePosition(positionId);
      await loadOpenPositions(); // Refresh open positions
      showNotification({
        type: 'success',
        message: 'Position closed successfully'
      });
    });
  };

  const refreshPositions = async () => {
    await withLoading(async () => {
      await Promise.all([
        loadOpenPositions(),
        loadClosedPositions()
      ]);
    });
  };

  return {
    // State
    openPositions,
    closedPositions,
    selectedPosition,
    isLoading,

    // Methods
    loadOpenPositions,
    loadClosedPositions,
    closePosition,
    refreshPositions,
    setSelectedPosition,
  };
};
