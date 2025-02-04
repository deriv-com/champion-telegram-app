import { BaseApi } from './base-api';
import { TradingApiRegistry } from '@/schemas/api/trading.js';

/**
 * API class for Deriv WebSocket trading operations
 * Based on https://developers.deriv.com/docs/websockets
 */
export class TradingApi extends BaseApi {
  /**
   * @param {Object} [options] Optional configuration
   */
  constructor(ws, options = {}) {
    super(ws, options);
    this.endpoints = TradingApiRegistry.endpoints;
  }

  /**
   * Buy contract
   * Example:
   * {
   *   "buy": "uw2mk7no3oktoRVVsB4Dz7TQnFfAB",
   *   "price": 100,
   *   "req_id": 1
   * }
   * @param {Object} params Buy parameters
   * @param {string} params.contractId Contract ID to buy
   * @param {number} params.price Price to buy at
   * @returns {Promise<Object>} Buy response
   */
  buyContract(params) {
    if (!params.contractId || !params.price) {
      throw new Error('Contract ID and price are required');
    }

    return this.send({
      buy: params.contractId,
      price: params.price
    });
  }

  /**
   * Cancel contract
   * Example:
   * {
   *   "cancel": "uw2mk7no3oktoRVVsB4Dz7TQnFfAB",
   *   "req_id": 2
   * }
   * @param {string} contractId Contract ID to cancel
   * @returns {Promise<Object>} Cancel response
   */
  cancelContract(contractId) {
    if (!contractId) {
      throw new Error('Contract ID is required');
    }

    return this.send({
      cancel: contractId
    });
  }

  /**
   * Get portfolio
   * Example:
   * {
   *   "portfolio": 1,
   *   "contract_type": ["CALL", "PUT"],
   *   "contract_id": 11111111,
   *   "limit": 100,
   *   "req_id": 3
   * }
   * @param {Object} [params] Portfolio parameters
   * @returns {Promise<Object>} Portfolio data
   */
  getPortfolio(params = {}) {
    return this.send({
      portfolio: 1,
      contract_type: params.contract_type,
      contract_id: params.contract_id,
      limit: params.limit
    });
  }

  /**
   * Subscribe to portfolio updates
   * Example:
   * {
   *   "portfolio": 1,
   *   "subscribe": 1,
   *   "req_id": 4
   * }
   * @param {Function} callback Callback for portfolio updates
   * @returns {Promise<Object>} Portfolio subscription
   */
  subscribePortfolio(callback) {
    return this.subscribe({
      portfolio: 1
    }, callback);
  }

  /**
   * Get profit table
   * Example:
   * {
   *   "profit_table": 1,
   *   "description": 1,
   *   "limit": 25,
   *   "offset": 25,
   *   "sort": "ASC",
   *   "req_id": 5
   * }
   * @param {Object} [params] Profit table parameters
   * @returns {Promise<Object>} Profit table data
   */
  getProfitTable(params = {}) {
    return this.send({
      profit_table: 1,
      description: params.description,
      limit: params.limit,
      offset: params.offset,
      sort: params.sort
    });
  }

  /**
   * Get statement
   * Example:
   * {
   *   "statement": 1,
   *   "description": 1,
   *   "limit": 100,
   *   "offset": 0,
   *   "req_id": 6
   * }
   * @param {Object} [params] Statement parameters
   * @returns {Promise<Object>} Statement data
   */
  getStatement(params = {}) {
    return this.send({
      statement: 1,
      description: params.description,
      limit: params.limit,
      offset: params.offset
    });
  }

  /**
   * Get open contract details
   * Example:
   * {
   *   "proposal_open_contract": 1,
   *   "contract_id": 11111111,
   *   "subscribe": 1,
   *   "req_id": 7
   * }
   * @param {Object} params Contract parameters
   * @param {Function} [callback] Callback for contract updates
   * @returns {Promise<Object>} Contract details
   */
  getOpenContract(params, callback) {
    if (!params.contract_id) {
      throw new Error('Contract ID is required');
    }

    const request = {
      proposal_open_contract: 1,
      contract_id: params.contract_id
    };

    return callback 
      ? this.subscribe(request, callback)
      : this.send(request);
  }

  /**
   * Get all open contracts
   * Example:
   * {
   *   "proposal_open_contract": 1,
   *   "subscribe": 1,
   *   "req_id": 8
   * }
   * @param {Function} [callback] Callback for contract updates
   * @returns {Promise<Object>} Open contracts
   */
  getAllOpenContracts(callback) {
    const request = {
      proposal_open_contract: 1
    };

    return callback
      ? this.subscribe(request, callback)
      : this.send(request);
  }

  /**
   * Sell contract
   * Example:
   * {
   *   "sell": "uw2mk7no3oktoRVVsB4Dz7TQnFfAB",
   *   "price": 500,
   *   "req_id": 9
   * }
   * @param {Object} params Sell parameters
   * @returns {Promise<Object>} Sell response
   */
  sellContract(params) {
    if (!params.contractId) {
      throw new Error('Contract ID is required');
    }

    return this.send({
      sell: params.contractId,
      price: params.price
    });
  }

  /**
   * Top up virtual account
   * Example:
   * {
   *   "topup_virtual": 1,
   *   "req_id": 10
   * }
   * @returns {Promise<Object>} Top up response
   */
  topUpVirtual() {
    return this.send({
      topup_virtual: 1
    });
  }


  /**
   * Copy trading: List copyable traders
   * Example:
   * {
   *   "copytrading_list": 1,
   *   "req_id": 11
   * }
   * @returns {Promise<Object>} List of copyable traders
   */
  getCopyableTraders() {
    return this.send({
      copytrading_list: 1
    });
  }

  /**
   * Copy trading: Statistics
   * Example:
   * {
   *   "copytrading_statistics": 1,
   *   "trader_id": "CR1234",
   *   "req_id": 12
   * }
   * @param {string} traderId Trader ID
   * @returns {Promise<Object>} Trader statistics
   */
  getTraderStatistics(traderId) {
    if (!traderId) {
      throw new Error('Trader ID is required');
    }

    return this.send({
      copytrading_statistics: 1,
      trader_id: traderId
    });
  }
}
