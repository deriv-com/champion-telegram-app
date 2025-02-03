import { BaseApi } from './base-api.js';
import { MarketApiRegistry } from '@/schemas/api/market.js';
import { API_METHODS } from '@/schemas/api/base.js';

/**
 * @typedef {import('@/schemas/api/base.js').BaseRequest} BaseRequest
 * @typedef {import('@/schemas/api/base.js').BaseResponse} BaseResponse
 */

/**
 * API class for Deriv WebSocket market operations
 * Based on https://developers.deriv.com/docs/websockets
 */
export class MarketApi extends BaseApi {
  /**
   * @param {import('@/services/websocket.service').default} websocket WebSocket manager instance
   */
  constructor(websocket) {
    super(websocket);
    this.endpoints = MarketApiRegistry.endpoints;
  }

  /**
   * Get asset index
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Asset index containing available trade types and parameters
   */
  getAssetIndex(options = {}) {
    return this.send(
      this.endpoints.assetIndex,
      { asset_index: 1 },
      options
    );
  }

  /**
   * Get active symbols
   * @param {Object} [params] Request parameters
   * @param {string} [params.active_symbols="brief"] Type of active symbols data ("brief" or "full")
   * @param {string} [params.product_type] If specified, active symbols for this product type only
   * @param {string[]} [params.contract_type] Array of contract types to filter active symbols
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Active symbols
   */
  getActiveSymbols(params = {}, options = {}) {
    return this.send(
      this.endpoints.activeSymbols,
      {
        active_symbols: params.active_symbols || 'brief',
        product_type: params.product_type,
        contract_type: params.contract_type
      },
      options
    );
  }

  /**
   * Get contracts for symbol
   * @param {Object} params Request parameters
   * @param {string} params.symbol Symbol code
   * @param {string} [params.currency] Currency to get contracts for
   * @param {string} [params.landing_company] Landing company
   * @param {string} [params.product_type] Product type
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Contracts for symbol
   */
  getContractsFor(params, options = {}) {
    return this.send(
      this.endpoints.contractsFor,
      {
        contracts_for: params.symbol,
        currency: params.currency,
        landing_company: params.landing_company,
        product_type: params.product_type
      },
      options
    );
  }

  /**
   * Subscribe to price proposal updates
   * Example:
   * {
   *   "proposal": 1,
   *   "subscribe": 1,
   *   "amount": 10,
   *   "basis": "stake",
   *   "contract_type": "DIGITMATCH",
   *   "currency": "AUD",
   *   "symbol": "1HZ100V",
   *   "duration": 1,
   *   "duration_unit": "t",
   *   "barrier": 5
   * }
   * @param {Object} params Proposal parameters
   * @param {number} params.amount Contract amount
   * @param {string} params.basis "stake" or "payout"
   * @param {string} params.contract_type Contract type
   * @param {string} params.currency Currency code
   * @param {string} params.symbol Market symbol
   * @param {number} params.duration Contract duration
   * @param {string} params.duration_unit Duration unit (t: ticks, s: seconds, m: minutes, h: hours, d: days)
   * @param {string|number} [params.barrier] Contract barrier (required for some contract types)
   * @param {Function} callback Callback for proposal updates
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Proposal subscription
   */
  /**
   * Subscribe to price proposal updates
   * Example request:
   * ```javascript
   * const subscription = await marketApi.subscribeProposal({
   *   amount: 10,
   *   basis: 'stake',
   *   contractType: 'DIGITMATCH',
   *   currency: 'USD',
   *   symbol: '1HZ100V',
   *   duration: 1,
   *   durationUnit: 't',
   *   barrier: 5,
   *   productType: 'basic'
   * }, (response) => {
   *   console.log('Price update:', response.proposal);
   * });
   * 
   * // Later, to unsubscribe:
   * await marketApi.unsubscribeProposal(subscription.reqId);
   * ```
   * 
   * Error handling:
   * ```javascript
   * try {
   *   const subscription = await marketApi.subscribeProposal({...}, callback);
   * } catch (error) {
   *   if (error.code === 'MarketIsClosed') {
   *     console.error('Market is currently closed');
   *   } else if (error.code === 'InvalidParameters') {
   *     console.error('Invalid parameters:', error.message);
   *   } else {
   *     console.error('Subscription failed:', error);
   *   }
   * }
   * ```
   * 
   * @param {Object} params Proposal parameters
   * @param {number} params.amount Contract amount
   * @param {string} params.basis "stake" or "payout"
   * @param {string} params.contractType Contract type
   * @param {string} params.currency Currency code (3 letters)
   * @param {string} params.symbol Market symbol
   * @param {number} params.duration Contract duration (minimum: 1)
   * @param {string} params.durationUnit Duration unit (t: ticks, s: seconds, m: minutes, h: hours, d: days)
   * @param {string|number} [params.barrier] Contract barrier (required for some contract types)
   * @param {string} [params.productType] Product type
   * @param {Function} callback Callback for proposal updates
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Proposal subscription details
   * @throws {Error} If required parameters are missing or invalid
   */
  subscribeProposal(params, callback, options = {}) {
    // Validate required parameters
    if (!params.amount || !params.basis || !params.contractType || 
        !params.currency || !params.symbol || !params.duration || 
        !params.durationUnit) {
      throw new Error('Required proposal parameters missing');
    }

    // Validate currency format
    if (!/^[A-Z]{3}$/.test(params.currency)) {
      throw new Error('Currency must be a 3-letter code');
    }

    // Validate amount and duration
    if (params.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (params.duration < 1) {
      throw new Error('Duration must be at least 1');
    }

    // Format parameters from camelCase to snake_case
    const formattedParams = this.formatRequestParams({
      proposal: 1,
      amount: params.amount,
      basis: params.basis,
      contractType: params.contractType,
      currency: params.currency,
      symbol: params.symbol,
      duration: params.duration,
      durationUnit: params.durationUnit,
      barrier: params.barrier,
      productType: params.productType
    });

    // Subscribe with formatted parameters
    return this.subscribe(
      this.endpoints.proposal,
      formattedParams,
      (response) => {
        // Format response from snake_case to camelCase before passing to callback
        callback(this.formatResponseData(response));
      },
      options
    );
  }

  /**
   * Unsubscribe from price proposal updates
   * @param {string|number} subscriptionId Subscription ID to unsubscribe
   * @returns {Promise<void>}
   */
  async unsubscribeProposal(subscriptionId) {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }
    await this.ws.unsubscribe(subscriptionId);
  }

  /**
   * Subscribe to ticks history for a symbol
   * Example:
   * ```javascript
   * const subscription = await marketApi.subscribeTicksHistory({
   *   symbol: '1HZ100V',
   *   style: 'ticks',
   *   end: 'latest',
   *   count: 1000,
   *   adjustStartTime: 1
   * }, (response) => {
   *   if (response.msg_type === 'history') {
   *     console.log('Initial history:', response.history);
   *   } else if (response.msg_type === 'tick') {
   *     console.log('New tick:', response.tick);
   *   }
   * });
   * 
   * // Later, to unsubscribe:
   * await marketApi.unsubscribeTicksHistory(subscription.reqId);
   * ```
   * 
   * @param {Object} params Request parameters
   * @param {string} params.symbol Symbol code (e.g. '1HZ100V')
   * @param {string} params.style Data style ('ticks' or 'candles')
   * @param {string|number} params.end End time ('latest' or epoch)
   * @param {number} [params.count] Number of ticks/candles (default: 1000)
   * @param {number} [params.adjustStartTime] Adjust start time to account for missing ticks (0 or 1)
   * @param {string|number} [params.start] Start time (epoch)
   * @param {Function} callback Callback for tick updates
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Subscription details
   * @throws {Error} If required parameters are missing or invalid
   */
  subscribeTicksHistory(params, callback, options = {}) {
    // Validate required parameters
    if (!params.symbol || !params.style || !params.end) {
      throw new Error('Required parameters missing: symbol, style, end');
    }

    // Validate style parameter
    if (!['ticks', 'candles'].includes(params.style)) {
      throw new Error('Style must be either "ticks" or "candles"');
    }

    // Format parameters from camelCase to snake_case
    const formattedParams = this.formatRequestParams({
      ticksHistory: params.symbol,
      style: params.style,
      end: params.end,
      count: params.count || 1000,
      adjustStartTime: params.adjustStartTime,
      start: params.start,
      subscribe: 1
    });

    // Subscribe with formatted parameters
    return this.subscribe(
      this.endpoints.ticksHistory,
      formattedParams,
      (response) => {
        // Format response from snake_case to camelCase before passing to callback
        callback(this.formatResponseData(response));
      },
      options
    );
  }

  /**
   * Unsubscribe from ticks history updates
   * @param {string|number} subscriptionId Subscription ID to unsubscribe
   * @returns {Promise<void>}
   */
  async unsubscribeTicksHistory(subscriptionId) {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }
    await this.ws.unsubscribe(subscriptionId);
  }
}
