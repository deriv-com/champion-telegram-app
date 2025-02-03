import { BaseApi } from './base-api';

/**
 * API class for Deriv WebSocket market operations
 * Based on https://developers.deriv.com/docs/websockets
 */
export class MarketApi extends BaseApi {
  /**
   * Subscribe to tick stream
   * Example:
   * {
   *   "ticks": "frxUSDJPY",
   *   "subscribe": 1,
   *   "req_id": 1
   * }
   * @param {string} symbol Symbol to subscribe to
   * @param {Function} callback Callback for tick updates
   * @returns {Promise<Object>} Tick subscription
   */
  subscribeTicks(symbol, callback) {
    return this.subscribe({
      ticks: symbol
    }, callback);
  }

  /**
   * Get active symbols
   * Example:
   * {
   *   "active_symbols": "brief",
   *   "product_type": "basic",
   *   "req_id": 2
   * }
   * @param {Object} params Request parameters
   * @param {string} [params.active_symbols="brief"] Type of active symbols data
   * @param {string} [params.product_type] If specified, active symbols for this product type only
   * @returns {Promise<Object>} Active symbols
   */
  getActiveSymbols(params = {}) {
    return this.send({
      active_symbols: params.active_symbols || 'brief',
      product_type: params.product_type
    });
  }

  /**
   * Get contracts for symbol
   * Example:
   * {
   *   "contracts_for": "R_50",
   *   "currency": "USD",
   *   "landing_company": "svg",
   *   "product_type": "basic",
   *   "req_id": 3
   * }
   * @param {Object} params Request parameters
   * @param {string} params.symbol Symbol code
   * @param {string} [params.currency] Currency to get contracts for
   * @param {string} [params.landing_company] Landing company
   * @param {string} [params.product_type] Product type
   * @returns {Promise<Object>} Contracts for symbol
   */
  getContractsFor(params) {
    if (!params.symbol) {
      throw new Error('Symbol is required');
    }

    return this.send({
      contracts_for: params.symbol,
      currency: params.currency,
      landing_company: params.landing_company,
      product_type: params.product_type
    });
  }

  /**
   * Get price proposal
   * Example:
   * {
   *   "proposal": 1,
   *   "amount": 100,
   *   "barrier": "+0.1",
   *   "basis": "payout",
   *   "contract_type": "CALL",
   *   "currency": "USD",
   *   "duration": 60,
   *   "duration_unit": "s",
   *   "symbol": "R_100",
   *   "req_id": 4
   * }
   * @param {Object} params Proposal parameters
   * @returns {Promise<Object>} Price proposal
   */
  getPriceProposal(params) {
    const requiredParams = [
      'amount',
      'basis',
      'contract_type',
      'currency',
      'duration',
      'duration_unit',
      'symbol'
    ];

    for (const param of requiredParams) {
      if (!params[param]) {
        throw new Error(`${param} is required`);
      }
    }

    return this.send({
      proposal: 1,
      ...params
    });
  }

  /**
   * Subscribe to price proposal
   * Example:
   * {
   *   "proposal": 1,
   *   "amount": 100,
   *   "barrier": "+0.1",
   *   "basis": "payout",
   *   "contract_type": "CALL",
   *   "currency": "USD",
   *   "duration": 60,
   *   "duration_unit": "s",
   *   "symbol": "R_100",
   *   "subscribe": 1,
   *   "req_id": 5
   * }
   * @param {Object} params Proposal parameters
   * @param {Function} callback Callback for proposal updates
   * @returns {Promise<Object>} Proposal subscription
   */
  subscribePriceProposal(params, callback) {
    const requiredParams = [
      'amount',
      'basis',
      'contract_type',
      'currency',
      'duration',
      'duration_unit',
      'symbol'
    ];

    for (const param of requiredParams) {
      if (!params[param]) {
        throw new Error(`${param} is required`);
      }
    }

    return this.subscribe({
      proposal: 1,
      ...params
    }, callback);
  }

  /**
   * Get trading times
   * Example:
   * {
   *   "trading_times": "2023-03-01",
   *   "req_id": 6
   * }
   * @param {string} date Trading date (YYYY-MM-DD)
   * @returns {Promise<Object>} Trading times
   */
  getTradingTimes(date) {
    if (!date) {
      throw new Error('Date is required');
    }

    return this.send({
      trading_times: date
    });
  }

  /**
   * Get price history
   * Example:
   * {
   *   "ticks_history": "R_50",
   *   "adjust_start_time": 1,
   *   "count": 10,
   *   "end": "latest",
   *   "start": 1,
   *   "style": "ticks",
   *   "req_id": 7
   * }
   * @param {Object} params History parameters
   * @returns {Promise<Object>} Price history
   */
  getPriceHistory(params) {
    if (!params.ticks_history) {
      throw new Error('Symbol is required');
    }

    return this.send({
      ticks_history: params.ticks_history,
      adjust_start_time: params.adjust_start_time,
      count: params.count,
      end: params.end || 'latest',
      start: params.start,
      style: params.style || 'ticks'
    });
  }

  /**
   * Subscribe to candles
   * Example:
   * {
   *   "ticks_history": "R_50",
   *   "adjust_start_time": 1,
   *   "count": 10,
   *   "end": "latest",
   *   "start": 1,
   *   "style": "candles",
   *   "subscribe": 1,
   *   "req_id": 8
   * }
   * @param {Object} params Candle parameters
   * @param {Function} callback Callback for candle updates
   * @returns {Promise<Object>} Candle subscription
   */
  subscribeCandles(params, callback) {
    if (!params.ticks_history) {
      throw new Error('Symbol is required');
    }

    return this.subscribe({
      ticks_history: params.ticks_history,
      adjust_start_time: params.adjust_start_time,
      count: params.count,
      end: params.end || 'latest',
      start: params.start,
      style: 'candles',
      granularity: params.granularity
    }, callback);
  }
}
