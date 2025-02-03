import { BaseApi } from './base-api';
import { WS_MESSAGE_TYPES } from '@/constants/websocket.constants';

/**
 * API class for Deriv WebSocket authorization
 * Based on https://developers.deriv.com/docs/websockets
 */
export class AuthApi extends BaseApi {
  /**
   * Authorize using token
   * Example:
   * {
   *   "authorize": "AUTHORIZATION_TOKEN",
   *   "req_id": 1
   * }
   * @param {string} token Authorization token
   * @returns {Promise<Object>} Authorization response
   */
  authorize(token) {
    if (!token) {
      throw new Error('Token is required');
    }

    return this.send({
      [WS_MESSAGE_TYPES.Authorize]: token
    });
  }

  /**
   * Get account balance
   * Example:
   * {
   *   "balance": 1,
   *   "subscribe": 1,
   *   "req_id": 2
   * }
   * @param {Function} callback Callback for balance updates
   * @returns {Promise<Object>} Balance subscription
   */
  subscribeBalance(callback) {
    return this.subscribe({
      balance: 1
    }, callback);
  }

  /**
   * Get account status
   * Example:
   * {
   *   "get_account_status": 1,
   *   "req_id": 3
   * }
   * @returns {Promise<Object>} Account status
   */
  getAccountStatus() {
    return this.send({
      get_account_status: 1
    });
  }

  /**
   * Get account settings
   * Example:
   * {
   *   "get_settings": 1,
   *   "req_id": 4
   * }
   * @returns {Promise<Object>} Account settings
   */
  getSettings() {
    return this.send({
      get_settings: 1
    });
  }

  /**
   * Update account settings
   * Example:
   * {
   *   "set_settings": 1,
   *   "request_password": 1,
   *   "req_id": 5
   * }
   * @param {Object} settings Settings to update
   * @returns {Promise<Object>} Update response
   */
  setSettings(settings) {
    return this.send({
      set_settings: 1,
      ...settings
    });
  }

  /**
   * Logout
   * Example:
   * {
   *   "logout": 1,
   *   "req_id": 6
   * }
   * @returns {Promise<Object>} Logout response
   */
  logout() {
    return this.send({
      logout: 1
    });
  }

  /**
   * Keep connection alive
   * Example:
   * {
   *   "ping": 1,
   *   "req_id": 7
   * }
   * @returns {Promise<Object>} Ping response
   */
  ping() {
    return this.send({
      ping: 1
    });
  }

  /**
   * Get server time
   * Example:
   * {
   *   "time": 1,
   *   "req_id": 8
   * }
   * @returns {Promise<Object>} Server time
   */
  getServerTime() {
    return this.send({
      time: 1
    });
  }

  /**
   * Get website status
   * Example:
   * {
   *   "website_status": 1,
   *   "req_id": 9
   * }
   * @returns {Promise<Object>} Website status
   */
  getWebsiteStatus() {
    return this.send({
      website_status: 1
    });
  }
}
