import websocketService from '@/services/websocket.service';
import { WS_MESSAGE_TYPES } from '@/constants/websocket.constants';

const ws = websocketService.instance;

// Message types used in this module
const {
  ActiveSymbols,
  TicksHistory,
  PriceProposal,
  Balance,
  Authorize,
  Forget
} = WS_MESSAGE_TYPES;

/**
 * Market API for handling market data operations
 */
export const marketApi = {
  /**
   * Subscribe to market ticks
   * @param {string} symbol Market symbol
   * @param {Function} callback Callback for tick updates
   * @returns {Promise<Object>} Subscription details
   */
  subscribeToTicks: async (symbol, callback) => {
    try {
      return await ws.api.market.subscribe(
        ws.api.market.endpoints.ticksHistory,
        {
          [TicksHistory]: symbol,
          style: 'ticks',
          end: 'latest',
          count: 1,
          adjust_start_time: 1
        },
        callback
      );
    } catch (error) {
      console.error('Failed to subscribe to ticks:', error);
      throw error;
    }
  },

  /**
   * Subscribe to price proposal
   * @param {Object} params Proposal parameters
   * @param {Function} callback Callback for proposal updates
   * @returns {Promise<Object>} Subscription details
   */
  subscribeToProposal: async (params, callback) => {
    try {
      const { symbol, contractType, duration, stake, prediction } = params;
      
      if (!symbol || !contractType || !duration || !stake || prediction === undefined) {
        throw new Error('Missing required proposal parameters');
      }

      return await ws.api.market.subscribe(
        ws.api.market.endpoints.proposal,
        {
          [PriceProposal]: 1,
          amount: stake,
          basis: 'stake',
          contract_type: contractType,
          currency: 'USD',
          symbol,
          duration,
          duration_unit: 't',
          barrier: prediction.toString()
        },
        callback
      );
    } catch (error) {
      console.error('Failed to subscribe to proposal:', error);
      throw error;
    }
  },

  /**
   * Unsubscribe from market data stream
   * @param {string} subscriptionId Subscription ID
   * @returns {Promise<void>}
   */
  unsubscribe: async (subscriptionId) => {
    try {
      await ws.api.market.send({
        [Forget]: subscriptionId
      });
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  }
};

/**
 * Auth API for handling authentication operations
 */
export const authApi = {
  /**
   * Authorize with token
   * @param {string} token Authorization token
   * @returns {Promise<Object>} Authorization response
   */
  authorize: async (token) => {
    try {
      const response = await ws.api.auth.send(
        ws.api.auth.endpoints.authorize,
        {
          [Authorize]: token
        }
      );
      return response.authorize;
    } catch (error) {
      console.error('Authorization failed:', error);
      throw error;
    }
  },

  /**
   * Subscribe to balance updates
   * @param {Function} callback Callback for balance updates
   * @returns {Promise<Object>} Subscription details
   */
  subscribeToBalance: async (callback) => {
    try {
      return await ws.api.auth.subscribe(
        ws.api.auth.endpoints.balance,
        {
          [Balance]: 1
        },
        callback
      );
    } catch (error) {
      console.error('Failed to subscribe to balance:', error);
      throw error;
    }
  }
};
