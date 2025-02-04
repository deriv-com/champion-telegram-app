import { API_METHODS } from './base.js';

/**
 * @typedef {import('./base.js').ApiCategory} ApiCategory
 */

/**
 * Trading API Registry
 * @type {ApiCategory}
 */
export const TradingApiRegistry = {
  name: 'trading',
  description: 'Trading operations and contract management',
  endpoints: {
    buy: {
      name: 'Buy Contract',
      description: 'Buy a contract',
      method: API_METHODS.BUY,
      requestSchema: {
        type: 'object',
        properties: {
          buy: { type: 'string' },
          price: { type: 'number', minimum: 0 }
        },
        required: ['buy', 'price']
      },
      responseSchema: {
        type: 'object',
        properties: {
          buy: {
            type: 'object',
            properties: {
              contract_id: { type: 'number' },
              longcode: { type: 'string' },
              start_time: { type: 'number' }
            },
            required: ['contract_id', 'longcode']
          }
        },
        required: ['buy']
      }
    },
    sell: {
      name: 'Sell Contract',
      description: 'Sell a contract',
      method: API_METHODS.SELL,
      requestSchema: {
        type: 'object',
        properties: {
          sell: { type: 'string' },
          price: { type: 'number', minimum: 0 }
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
    },
    portfolio: {
      name: 'Portfolio',
      description: 'Get portfolio of outstanding contracts',
      method: API_METHODS.PORTFOLIO,
      isSubscription: true,
      requestSchema: {
        type: 'object',
        properties: {
          portfolio: { type: 'number', enum: [1] },
          contract_type: { type: 'array', items: { type: 'string' } },
          contract_id: { type: 'number' },
          limit: { type: 'number', minimum: 1 }
        },
        required: ['portfolio']
      },
      responseSchema: {
        type: 'object',
        properties: {
          portfolio: {
            type: 'object',
            properties: {
              contracts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    contract_id: { type: 'number' },
                    longcode: { type: 'string' },
                    contract_type: { type: 'string' },
                    currency: { type: 'string' },
                    payout: { type: 'number' },
                    purchase_time: { type: 'number' },
                    symbol: { type: 'string' }
                  },
                  required: ['contract_id', 'longcode', 'contract_type']
                }
              }
            },
            required: ['contracts']
          }
        },
        required: ['portfolio']
      }
    },
    proposalOpenContract: {
      name: 'Open Contract Details',
      description: 'Get latest price and other information for a contract',
      method: API_METHODS.PROPOSAL_OPEN_CONTRACT,
      isSubscription: true,
      requestSchema: {
        type: 'object',
        properties: {
          proposal_open_contract: { type: 'number', enum: [1] },
          contract_id: { type: 'number' },
          subscribe: { type: 'number', enum: [1] }
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
              profit: { type: 'number' },
              profit_percentage: { type: 'number' },
              is_valid_to_sell: { type: 'number' },
              is_sold: { type: 'number' }
            },
            required: ['contract_id', 'status']
          }
        },
        required: ['proposal_open_contract']
      }
    }
  }
};
