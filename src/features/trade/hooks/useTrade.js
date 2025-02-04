import { useState, useEffect, useRef } from 'react';
import websocketService from '@/services/websocket.service';
import { WS_MESSAGE_TYPES } from '@/constants/websocket.constants';

export const useTrade = () => {
  const [activeSymbols, setActiveSymbols] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    
    const loadSymbols = async () => {
      if (!mounted.current) return;
      
      try {
        setIsLoading(true);
        const ws = websocketService.instance;
        
        console.log('Requesting active symbols...');
        const response = await ws.api.market.getActiveSymbols({
          active_symbols: 'brief',
          contract_type: ['DIGITMATCH', 'DIGITDIFF']
        });
        
        console.log('Active symbols response:', response);
        
        if (mounted.current && Array.isArray(response?.active_symbols)) {
          console.log('Setting active symbols:', response.active_symbols.length);
          setActiveSymbols(response.active_symbols);
        } else {
          console.error('Invalid active symbols response:', response);
        }
      } catch (error) {
        console.error('Failed to load active symbols:', error);
      } finally {
        if (mounted.current) {
          setIsLoading(false);
        }
      }
    };

    loadSymbols();

    return () => {
      mounted.current = false;
    };
  }, []);

  return {
    activeSymbols,
    isLoading
  };
};
