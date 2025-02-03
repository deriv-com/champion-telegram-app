import { API_METHODS } from './base.js';

/**
 * @typedef {import('./base.js').ApiCategory} ApiCategory
 */

/**
 * Market API Registry
 * @type {ApiCategory}
 */
export const MarketApiRegistry = {
  name: 'market',
  description: 'Market data and trading information',
  endpoints: {
    ticksHistory: {
      name: 'Ticks History',
      description: 'Get history and stream of ticks for a given symbol',
      method: API_METHODS.TICKS_HISTORY,
      isSubscription: true,
      requestSchema: {
        type: 'object',
        properties: {
          ticks_history: { type: 'string' },
          adjust_start_time: { type: 'number', enum: [0, 1] },
          count: { type: 'number', minimum: 1 },
          end: { type: ['string', 'number'] },
          start: { type: ['string', 'number'] },
          style: { type: 'string', enum: ['ticks', 'candles'] },
          subscribe: { type: 'number', enum: [1] }
        },
        required: ['ticks_history', 'end', 'style']
      },
      responseSchema: {
        type: 'object',
        properties: {
          history: {
            type: 'object',
            properties: {
              prices: { type: 'array', items: { type: 'number' } },
              times: { type: 'array', items: { type: 'number' } }
            },
            required: ['prices', 'times']
          },
          subscription: {
            type: 'object',
            properties: {
              id: { type: 'string' }
            },
            required: ['id']
          },
          pip_size: { type: 'number' }
        },
        required: ['history', 'pip_size']
      }
    },
    proposal: {
      name: 'Price Proposal',
      description: 'Get contract price and purchase information',
      method: API_METHODS.PROPOSAL,
      isSubscription: true,
      requestSchema: {
        type: 'object',
        properties: {
          proposal: { type: 'number', enum: [1] },
          subscribe: { type: 'number', enum: [1] },
          amount: { type: 'number', minimum: 0 },
          basis: { type: 'string', enum: ['stake', 'payout'] },
          contract_type: { type: 'string' },
          currency: { type: 'string', minLength: 3, maxLength: 3 },
          symbol: { type: 'string' },
          duration: { type: 'number', minimum: 1 },
          duration_unit: { type: 'string', enum: ['t', 's', 'm', 'h', 'd'] },
          barrier: { type: ['string', 'number'] },
          product_type: { type: 'string' }
        },
        required: ['proposal', 'amount', 'basis', 'contract_type', 'currency', 'symbol', 'duration', 'duration_unit'],
        additionalProperties: false
      },
      responseSchema: {
        type: 'object',
        properties: {
          proposal: {
            type: 'object',
            properties: {
              ask_price: { type: 'number' },
              contract_details: {
                type: 'object',
                properties: {
                  barrier: { type: ['string', 'number'] }
                }
              },
              date_expiry: { type: 'number' },
              date_start: { type: 'number' },
              display_value: { type: 'string' },
              id: { type: 'string' },
              longcode: { type: 'string' },
              payout: { type: 'number' },
              spot: { type: 'number' },
              spot_time: { type: 'number' },
              validation_params: {
                type: 'object',
                properties: {
                  payout: {
                    type: 'object',
                    properties: {
                      max: { type: 'string' }
                    }
                  },
                  stake: {
                    type: 'object',
                    properties: {
                      min: { type: 'string' }
                    }
                  }
                }
              }
            },
            required: ['ask_price', 'id', 'longcode', 'spot']
          },
          subscription: {
            type: 'object',
            properties: {
              id: { type: 'string' }
            },
            required: ['id']
          }
        },
        required: ['proposal']
      }
    },
    assetIndex: {
      name: 'Asset Index',
      description: 'Retrieve a list of all available trading assets and their properties',
      method: API_METHODS.ASSET_INDEX,
      requestSchema: {
        type: 'object',
        properties: {
          asset_index: { type: 'number', enum: [1] }
        },
        required: ['asset_index']
      },
      responseSchema: {
        type: 'object',
        properties: {
          asset_index: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: { type: 'string' },
                name: { type: 'string' },
                contracts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      name: { type: 'string' },
                      min_duration: { type: 'string' },
                      max_duration: { type: 'string' }
                    },
                    required: ['type', 'name', 'min_duration', 'max_duration']
                  }
                }
              },
              required: ['symbol', 'name', 'contracts']
            }
          }
        },
        required: ['asset_index']
      }
    },
    activeSymbols: {
      name: 'Active Symbols',
      description: 'Retrieve a list of all currently active symbols',
      method: API_METHODS.ACTIVE_SYMBOLS,
      requestSchema: {
        type: 'object',
        properties: {
          active_symbols: { type: 'string', enum: ['brief', 'full'] },
          product_type: { type: 'string' },
          contract_type: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['active_symbols']
      },
      responseSchema: {
        type: 'object',
        properties: {
          active_symbols: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: { type: 'string' },
                symbol_type: { type: 'string' },
                display_name: { type: 'string' },
                market: { type: 'string' },
                market_display_name: { type: 'string' },
                pip: { type: 'number' },
                submarket: { type: 'string' },
                submarket_display_name: { type: 'string' },
                allow_forward_starting: { type: 'number' },
                exchange_is_open: { type: 'number' },
                is_trading_suspended: { type: 'number' },
                pip: { type: 'number' },
                subgroup: { type: 'string' },
                subgroup_display_name: { type: 'string' },
                display_order: { type: 'number' }
              },
              required: [
                'symbol',
                'symbol_type',
                'display_name',
                'market',
                'market_display_name'
              ]
            }
          }
        },
        required: ['active_symbols']
      }
    },
    contractsFor: {
      name: 'Contracts For Symbol',
      description: 'Retrieve available contracts for a specific symbol',
      method: API_METHODS.CONTRACTS_FOR,
      requestSchema: {
        type: 'object',
        properties: {
          contracts_for: { type: 'string' },
          currency: { type: 'string' },
          landing_company: { type: 'string' },
          product_type: { type: 'string' }
        },
        required: ['contracts_for']
      },
      responseSchema: {
        type: 'object',
        properties: {
          contracts_for: {
            type: 'object',
            properties: {
              available: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    category_name: { type: 'string' },
                    contract_type: { type: 'string' },
                    min_duration: { type: 'string' },
                    max_duration: { type: 'string' },
                    barriers: { type: 'number' },
                    min_amount: { type: 'number' },
                    max_amount: { type: 'number' }
                  },
                  required: [
                    'category_name',
                    'contract_type',
                    'min_duration',
                    'max_duration'
                  ]
                }
              },
              spot: { type: 'number' },
              exchange_rate: { type: 'number' },
              market: { type: 'string' },
              submarket: { type: 'string' }
            },
            required: ['available', 'spot']
          }
        },
        required: ['contracts_for']
      }
    }
  }
};
