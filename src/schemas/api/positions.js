import { API_METHODS } from './base.js';

/**
 * @typedef {import('./base.js').ApiCategory} ApiCategory
 */

/**
 * Positions API Registry
 * @type {ApiCategory}
 */
export const PositionsApiRegistry = {
  name: 'positions',
  description: 'Position management operations',
  endpoints: {
    openPositions: {
      name: 'Open Positions',
      description: 'Get list of open positions',
      method: API_METHODS.PROPOSAL_OPEN_CONTRACT,
      requestSchema: {
        type: 'object',
        properties: {
          proposal_open_contract: { type: 'number', enum: [1] },
          contract_type: { type: 'array', items: { type: 'string' } }
        },
        required: ['proposal_open_contract']
      },
      responseSchema: {
        type: 'object',
        properties: {
          proposal_open_contract: {
            type: 'object',
            properties: {
              contract_id: { type: 'number' },
              status: { type: 'string' },
              contract_type: { type: 'string' },
              buy_price: { type: 'number' },
              profit: { type: 'number' },
              profit_percentage: { type: 'number' }
            },
            required: ['contract_id', 'status', 'contract_type']
          }
        },
        required: ['proposal_open_contract']
      }
    },
    closedPositions: {
      name: 'Closed Positions',
      description: 'Get list of closed positions',
      method: API_METHODS.PROFIT_TABLE,
      requestSchema: {
        type: 'object',
        properties: {
          profit_table: { type: 'number', enum: [1] },
          description: { type: 'number', enum: [1] },
          sort: { type: 'string', enum: ['ASC', 'DESC'] }
        },
        required: ['profit_table']
      },
      responseSchema: {
        type: 'object',
        properties: {
          profit_table: {
            type: 'object',
            properties: {
              transactions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    transaction_id: { type: 'number' },
                    contract_id: { type: 'number' },
                    purchase_time: { type: 'number' },
                    sell_time: { type: 'number' },
                    buy_price: { type: 'number' },
                    sell_price: { type: 'number' },
                    profit: { type: 'number' }
                  },
                  required: ['transaction_id', 'contract_id']
                }
              }
            },
            required: ['transactions']
          }
        },
        required: ['profit_table']
      }
    },
    closePosition: {
      name: 'Close Position',
      description: 'Close an open position',
      method: API_METHODS.SELL,
      requestSchema: {
        type: 'object',
        properties: {
          sell: { type: 'string' }
        },
        required: ['sell']
      },
      responseSchema: {
        type: 'object',
        properties: {
          sell: {
            type: 'object',
            properties: {
              sold_for: { type: 'number' },
              transaction_id: { type: 'number' }
            },
            required: ['sold_for', 'transaction_id']
          }
        },
        required: ['sell']
      }
    }
  }
};
