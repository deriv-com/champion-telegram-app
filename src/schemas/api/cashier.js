import { API_METHODS } from './base.js';

/**
 * @typedef {import('./base.js').ApiCategory} ApiCategory
 */

/**
 * Cashier API Registry
 * @type {ApiCategory}
 */
export const CashierApiRegistry = {
  name: 'cashier',
  description: 'Cashier and payment operations',
  endpoints: {
    balance: {
      name: 'Account Balance',
      description: 'Get account balance information',
      method: 'balance',
      isSubscription: true,
      requestSchema: {
        type: 'object',
        properties: {
          balance: { type: 'number', enum: [1] },
          subscribe: { type: 'number', enum: [1] }
        },
        required: ['balance']
      },
      responseSchema: {
        type: 'object',
        properties: {
          balance: {
            type: 'object',
            properties: {
              balance: { type: 'number' },
              currency: { type: 'string' },
              id: { type: 'string' },
              loginid: { type: 'string' }
            },
            required: ['balance', 'currency', 'loginid']
          }
        },
        required: ['balance']
      }
    },
    deposit: {
      name: 'Deposit Funds',
      description: 'Initiate a deposit transaction',
      method: 'cashier',
      requestSchema: {
        type: 'object',
        properties: {
          cashier: { type: 'string', enum: ['deposit'] },
          amount: { type: 'number', minimum: 0 },
          currency: { type: 'string' }
        },
        required: ['cashier', 'amount', 'currency']
      },
      responseSchema: {
        type: 'object',
        properties: {
          cashier: {
            type: 'object',
            properties: {
              transaction_id: { type: 'string' },
              payment_url: { type: 'string' }
            },
            required: ['transaction_id']
          }
        },
        required: ['cashier']
      }
    },
    withdraw: {
      name: 'Withdraw Funds',
      description: 'Initiate a withdrawal transaction',
      method: 'cashier',
      requestSchema: {
        type: 'object',
        properties: {
          cashier: { type: 'string', enum: ['withdraw'] },
          amount: { type: 'number', minimum: 0 },
          currency: { type: 'string' }
        },
        required: ['cashier', 'amount', 'currency']
      },
      responseSchema: {
        type: 'object',
        properties: {
          cashier: {
            type: 'object',
            properties: {
              transaction_id: { type: 'string' },
              withdrawal_url: { type: 'string' }
            },
            required: ['transaction_id']
          }
        },
        required: ['cashier']
      }
    },
    transactionHistory: {
      name: 'Transaction History',
      description: 'Get transaction history',
      method: API_METHODS.STATEMENT,
      requestSchema: {
        type: 'object',
        properties: {
          statement: { type: 'number', enum: [1] },
          description: { type: 'number', enum: [1] },
          limit: { type: 'number', minimum: 1 },
          offset: { type: 'string' }
        },
        required: ['statement']
      },
      responseSchema: {
        type: 'object',
        properties: {
          statement: {
            type: 'object',
            properties: {
              transactions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    action_type: { type: 'string' },
                    amount: { type: 'number' },
                    balance_after: { type: 'number' },
                    transaction_id: { type: 'number' },
                    transaction_time: { type: 'string' }
                  },
                  required: ['transaction_id', 'amount', 'balance_after']
                }
              },
              count: { type: 'number' }
            },
            required: ['transactions']
          }
        },
        required: ['statement']
      }
    }
  }
};
