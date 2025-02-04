import { AuthApi } from './auth-api';
import { MarketApi } from './market-api';
import { TradingApi } from './trading-api';
import { AccountApi } from './account-api';

/**
 * Manages API instances and their lifecycle
 */
class ApiManager {
  constructor(ws) {
    if (!ws) {
      throw new Error('WebSocket instance is required');
    }
    
    this.ws = ws;
    this.initialized = false;
    this.apis = new Map();
  }

  /**
   * Initialize API instances
   */
  initialize() {
    if (this.initialized) {
      return;
    }

    // Create API instances with WebSocket instance
    this.apis.set('auth', new AuthApi(this.ws));
    this.apis.set('market', new MarketApi(this.ws));
    this.apis.set('trading', new TradingApi(this.ws));
    this.apis.set('account', new AccountApi(this.ws));

    this.initialized = true;
  }

  /**
   * Get API instance by name
   * @param {string} name API name
   * @returns {BaseApi} API instance
   */
  getApi(name) {
    if (!this.initialized) {
      this.initialize();
    }
    
    const api = this.apis.get(name);
    if (!api) {
      throw new Error(`API '${name}' not found`);
    }
    
    return api;
  }

  /**
   * Get auth API instance
   * @returns {AuthApi} Auth API instance
   */
  get auth() {
    return this.getApi('auth');
  }

  /**
   * Get market API instance
   * @returns {MarketApi} Market API instance
   */
  get market() {
    return this.getApi('market');
  }

  /**
   * Get trading API instance
   * @returns {TradingApi} Trading API instance
   */
  get trading() {
    return this.getApi('trading');
  }

  /**
   * Get account API instance
   * @returns {AccountApi} Account API instance
   */
  get account() {
    return this.getApi('account');
  }
}

export default ApiManager;
