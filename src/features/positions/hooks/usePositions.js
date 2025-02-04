import { useState } from 'react';
import { useLoading } from '@/hooks/useLoading';
import { useNotification } from '@/hooks/useNotification';
import websocketService from '@/services/websocket.service';

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
      const ws = websocketService.instance;
      const response = await ws.api.positions.getOpenPositions();
      if (response?.proposal_open_contract) {
        setOpenPositions([response.proposal_open_contract]);
      }
    });
  };

  const loadClosedPositions = async () => {
    await withLoading(async () => {
      const ws = websocketService.instance;
      const response = await ws.api.positions.getClosedPositions();
      if (response?.profit_table?.transactions) {
        setClosedPositions(response.profit_table.transactions);
      }
    });
  };

  const closePosition = async (positionId) => {
    await withLoading(async () => {
      const ws = websocketService.instance;
      const response = await ws.api.positions.closePosition(positionId);
      if (response?.sell?.sold_for) {
        await loadOpenPositions(); // Refresh open positions
        showNotification({
          type: 'success',
          message: 'Position closed successfully'
        });
      }
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
