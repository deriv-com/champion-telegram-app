import { BaseApi } from './base-api.js';

/**
 * API class for cashier operations
 */
export class CashierApi extends BaseApi {
  /**
   * @param {Object} [options] Optional configuration
   */
  constructor(ws, options = {}) {
    super(ws, options);
  }

  /**
   * Get account balance
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Balance information
   */
  getBalance(options = {}) {
    return this.send({
      balance: 1
    }, options);
  }

  /**
   * Deposit funds
   * @param {Object} params Deposit parameters
   * @param {number} params.amount Amount to deposit
   * @param {string} params.currency Currency code
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Deposit response
   */
  deposit(params, options = {}) {
    if (!params.amount || typeof params.amount !== 'number' || params.amount <= 0) {
      throw new Error('Valid deposit amount is required');
    }
    if (!params.currency || typeof params.currency !== 'string') {
      throw new Error('Valid currency code is required');
    }

    return this.send({
      cashier: 'deposit',
      amount: params.amount,
      currency: params.currency
    }, options);
  }

  /**
   * Withdraw funds
   * @param {Object} params Withdrawal parameters
   * @param {number} params.amount Amount to withdraw
   * @param {string} params.currency Currency code
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Withdrawal response
   */
  withdraw(params, options = {}) {
    if (!params.amount || typeof params.amount !== 'number' || params.amount <= 0) {
      throw new Error('Valid withdrawal amount is required');
    }
    if (!params.currency || typeof params.currency !== 'string') {
      throw new Error('Valid currency code is required');
    }

    return this.send({
      cashier: 'withdraw',
      amount: params.amount,
      currency: params.currency
    }, options);
  }

  /**
   * Get transaction history
   * @param {Object} [params] Optional parameters
   * @param {number} [params.limit] Number of transactions to return
   * @param {string} [params.offset] Offset for pagination
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Transaction history
   */
  getTransactionHistory(params = {}, options = {}) {
    return this.send({
      statement: 1,
      description: 1,
      limit: params.limit,
      offset: params.offset
    }, options);
  }

  /**
   * Subscribe to balance updates
   * @param {Function} callback Callback for balance updates
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Subscription response
   */
  subscribeBalance(callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Callback function is required');
    }

    return this.subscribe({
      balance: 1,
      subscribe: 1
    }, callback, options);
  }

  /**
   * Unsubscribe from balance updates
   * @param {string} subscriptionId Subscription ID to unsubscribe
   * @returns {Promise<void>}
   */
  async unsubscribeBalance(subscriptionId) {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }
    await this.ws.unsubscribe(subscriptionId);
  }
}
