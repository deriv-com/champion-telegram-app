import { BaseApi } from './base-api.js';
import { AuthApiRegistry } from '@/schemas/api/auth.js';

/**
 * @typedef {import('@/schemas/api/base.js').BaseRequest} BaseRequest
 * @typedef {import('@/schemas/api/base.js').BaseResponse} BaseResponse
 */

/**
 * API class for Deriv WebSocket authorization
 * Based on https://developers.deriv.com/docs/account-apis
 */
export class AuthApi extends BaseApi {
  /**
   * @param {Object} [options] Optional configuration
   */
  constructor(ws, options = {}) {
    super(ws, options);
    this.endpoints = AuthApiRegistry.endpoints;
  }

  /**
   * Authorize using token
   * Example request:
   * ```javascript
   * const auth = await authApi.authorize('YOUR_TOKEN', {
   *   reqId: 1,
   *   passthrough: { source: 'login_page' }
   * });
   * console.log('Authorized user:', auth.authorize.loginid);
   * ```
   * 
   * Error handling:
   * ```javascript
   * try {
   *   const auth = await authApi.authorize(token);
   * } catch (error) {
   *   if (error.code === 'InvalidToken') {
   *     console.error('Token is invalid or expired');
   *   } else if (error.code === 'AuthorizationRequired') {
   *     console.error('Authorization has not been completed');
   *   } else {
   *     console.error('Authorization failed:', error);
   *   }
   * }
   * ```
   * 
   * @param {string} token Authorization token
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Authorization response containing account details
   * @throws {Error} If token is missing or invalid
   */
  authorize(token, options = {}) {
    if (!token || typeof token !== 'string') {
      throw new Error('Valid authorization token is required');
    }

    return this.send(
      this.endpoints.authorize,
      { authorize: token },
      options
    ).then(response => {
      // Update WebSocket service token on successful authorization
      if (response.authorize) {
        this.ws.currentToken = token;
      }
      return response;
    }).catch(error => {
      // Clear token on authorization failure
      this.ws.currentToken = null;
      throw error;
    });
  }

  /**
   * Subscribe to real-time account balance updates
   * Example request:
   * ```javascript
   * // Subscribe to balance updates
   * const subscription = await authApi.subscribeBalance((response) => {
   *   // Response format:
   *   // {
   *   //   balance: {
   *   //     balance: 10000,        // Current balance amount
   *   //     currency: "USD",       // Account currency
   *   //     id: "752f4779-...",   // Unique balance update ID
   *   //     loginid: "CR90001615" // Account login ID
   *   //   },
   *   //   subscription: {
   *   //     id: "752f4779-..."    // Subscription ID for unsubscribing
   *   //   },
   *   //   req_id: 3,              // Request ID if provided in options
   *   //   msg_type: "balance"     // Message type identifier
   *   // }
   *   
   *   console.log('New balance:', response.balance.balance);
   *   console.log('Currency:', response.balance.currency);
   *   console.log('Account:', response.balance.loginid);
   * }, {
   *   reqId: 3,
   *   passthrough: { source: 'dashboard' }
   * });
   * 
   * // Store subscription.subscription.id for later unsubscribing
   * const subscriptionId = subscription.subscription.id;
   * ```
   * 
   * Error handling:
   * ```javascript
   * try {
   *   const subscription = await authApi.subscribeBalance(callback);
   * } catch (error) {
   *   if (error.code === 'SubscriptionError') {
   *     console.error('Failed to subscribe to balance updates:', error.message);
   *   } else if (error.code === 'AuthorizationRequired') {
   *     console.error('Authorization required. Please log in.');
   *   } else if (error.code === 'RateLimit') {
   *     console.error('Too many subscription requests. Please try again later.');
   *   } else {
   *     console.error('Subscription failed:', error);
   *   }
   * }
   * ```
   * 
   * Note on response formatting:
   * The callback receives the response with all snake_case keys converted to camelCase.
   * For example:
   * - 'req_id' becomes 'reqId'
   * - 'msg_type' becomes 'msgType'
   * - 'login_id' becomes 'loginId'
   * 
   * @param {Function} callback Callback function that receives balance updates
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Balance subscription response containing subscription ID
   * @throws {Error} If callback is not a function
   * @throws {Error} If subscription fails due to authorization, rate limiting, or other issues
   */
  subscribeBalance(callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Callback function is required for balance subscription');
    }

    return this.subscribe(
      this.endpoints.balance,
      { balance: 1, subscribe: 1 },
      (response) => {
        // Format response from snake_case to camelCase before passing to callback
        callback(this.formatResponseData(response));
      },
      options
    );
  }

  /**
   * Unsubscribe from balance updates
   * Example:
   * ```javascript
   * try {
   *   // Unsubscribe using the subscription ID
   *   await authApi.unsubscribeBalance('752f4779-48df-785b-5b84-e2bc60c35f65');
   *   console.log('Successfully unsubscribed from balance updates');
   * } catch (error) {
   *   if (error.code === 'InvalidSubscriptionId') {
   *     console.error('Invalid or expired subscription ID');
   *   } else if (error.code === 'SubscriptionNotFound') {
   *     console.error('Subscription not found. Already unsubscribed?');
   *   } else {
   *     console.error('Failed to unsubscribe:', error);
   *   }
   * }
   * ```
   * 
   * @param {string} subscriptionId Subscription ID received from subscribeBalance response
   * @returns {Promise<void>}
   * @throws {Error} If subscription ID is missing or invalid
   * @throws {Error} If unsubscribe request fails
   */
  async unsubscribeBalance(subscriptionId) {
    if (!subscriptionId || typeof subscriptionId !== 'string') {
      throw new Error('Valid subscription ID is required');
    }
    await this.ws.unsubscribe(subscriptionId);
  }

  /**
   * Get account status
   * Example request:
   * ```javascript
   * const status = await authApi.getAccountStatus({
   *   reqId: 3,
   *   passthrough: { source: 'settings' }
   * });
   * console.log('Account status:', status.get_account_status.status);
   * ```
   * 
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Account status details
   */
  getAccountStatus(options = {}) {
    return this.send(
      this.endpoints.accountStatus,
      { get_account_status: 1 },
      options
    );
  }

  /**
   * Get account settings
   * Example request:
   * ```javascript
   * const settings = await authApi.getSettings({
   *   reqId: 4,
   *   passthrough: { source: 'profile' }
   * });
   * console.log('Account settings:', settings.get_settings);
   * ```
   * 
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Account settings
   */
  getSettings(options = {}) {
    return this.send(
      this.endpoints.settings,
      { get_settings: 1 },
      options
    );
  }

  /**
   * Update account settings
   * Example request:
   * ```javascript
   * const update = await authApi.setSettings({
   *   request_password: 1,
   *   new_password: 'NewSecurePass123'
   * }, {
   *   reqId: 5,
   *   passthrough: { source: 'settings' }
   * });
   * console.log('Settings updated:', update.set_settings);
   * ```
   * 
   * @param {Object} settings Settings to update
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Update response
   * @throws {Error} If settings object is empty
   */
  setSettings(settings, options = {}) {
    if (!settings || Object.keys(settings).length === 0) {
      throw new Error('Settings object is required');
    }

    return this.send(
      this.endpoints.setSettings,
      { set_settings: 1, ...settings },
      options
    );
  }

  /**
   * Logout from the current session
   * Example request:
   * ```javascript
   * const response = await authApi.logout({
   *   reqId: 6,
   *   passthrough: { source: 'navbar' }
   * });
   * console.log('Logged out:', response.logout === 1);
   * ```
   * 
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Logout response
   */
  logout(options = {}) {
    return this.send(
      this.endpoints.logout,
      { logout: 1 },
      options
    ).then(response => {
      // Clear token on successful logout
      if (response.logout === 1) {
        this.ws.currentToken = null;
      }
      return response;
    });
  }

  /**
   * Keep connection alive with ping
   * Example request:
   * ```javascript
   * const response = await authApi.ping({
   *   reqId: 7,
   *   passthrough: { source: 'heartbeat' }
   * });
   * console.log('Server responded:', response.ping);
   * ```
   * 
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Ping response
   */
  ping(options = {}) {
    return this.send(
      this.endpoints.ping,
      { ping: 1 },
      options
    );
  }

  /**
   * Get server time
   * Example request:
   * ```javascript
   * const response = await authApi.getServerTime({
   *   reqId: 8,
   *   passthrough: { source: 'sync' }
   * });
   * console.log('Server time:', new Date(response.time * 1000));
   * ```
   * 
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Server time
   */
  getServerTime(options = {}) {
    return this.send(
      this.endpoints.time,
      { time: 1 },
      options
    );
  }

  /**
   * Get website status
   * Example request:
   * ```javascript
   * const status = await authApi.getWebsiteStatus({
   *   reqId: 9,
   *   passthrough: { source: 'health_check' }
   * });
   * console.log('Site status:', status.website_status.site_status);
   * ```
   * 
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @returns {Promise<BaseResponse>} Website status
   */
  getWebsiteStatus(options = {}) {
    return this.send(
      this.endpoints.websiteStatus,
      { website_status: 1 },
      options
    );
  }
}
