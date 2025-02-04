import { BaseApi } from './base-api.js';

/**
 * API class for positions operations
 */
export class PositionsApi extends BaseApi {
  /**
   * @param {Object} [options] Optional configuration
   */
  constructor(ws, options = {}) {
    super(ws, options);
  }

  /**
   * Get open positions
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Open positions
   */
  getOpenPositions(options = {}) {
    return this.send({
      proposal_open_contract: 1,
      contract_type: ['CALL', 'PUT']
    }, options);
  }

  /**
   * Get closed positions
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Closed positions
   */
  getClosedPositions(options = {}) {
    return this.send({
      profit_table: 1,
      description: 1,
      sort: 'DESC'
    }, options);
  }

  /**
   * Close position
   * @param {string} positionId Position ID to close
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Close position response
   */
  closePosition(positionId, options = {}) {
    if (!positionId) {
      throw new Error('Position ID is required');
    }

    return this.send({
      sell: positionId
    }, options);
  }

  /**
   * Update stop loss
   * @param {string} positionId Position ID
   * @param {number} price Stop loss price
   * @param {Object} [options] Request options
   * @returns {Promise<Object>} Update response
   */
  updateStopLoss(positionId, price, options = {}) {
    if (!positionId) {
      throw new Error('Position ID is required');
    }
    if (typeof price !== 'number' || price <= 0) {
      throw new Error('Valid stop loss price is required');
    }

    return this.send({
      set_self_exclusion: 1,
      contract_id: positionId,
      stop_loss: price
    }, options);
  }
}
