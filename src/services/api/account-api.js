import { BaseApi } from './base-api';

/**
 * API class for Deriv WebSocket account operations
 * Based on https://developers.deriv.com/docs/websockets
 */
export class AccountApi extends BaseApi {
  /**
   * Get account balance
   * Example:
   * {
   *   "balance": 1,
   *   "account": "CR1234",
   *   "req_id": 1
   * }
   * @param {Object} [params] Optional parameters
   * @returns {Promise<Object>} Balance response
   */
  getBalance(params = {}) {
    return this.send({
      balance: 1,
      account: params.account
    });
  }

  /**
   * Subscribe to balance updates
   * Example:
   * {
   *   "balance": 1,
   *   "subscribe": 1,
   *   "account": "CR1234",
   *   "req_id": 2
   * }
   * @param {Function} callback Callback for balance updates
   * @param {Object} [params] Optional parameters
   * @returns {Promise<Object>} Balance subscription
   */
  subscribeBalance(callback, params = {}) {
    return this.subscribe({
      balance: 1,
      account: params.account
    }, callback);
  }

  /**
   * Get account list
   * Example:
   * {
   *   "account_list": 1,
   *   "req_id": 3
   * }
   * @returns {Promise<Object>} Account list
   */
  getAccountList() {
    return this.send({
      account_list: 1
    });
  }

  /**
   * Get account status
   * Example:
   * {
   *   "get_account_status": 1,
   *   "req_id": 4
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
   *   "req_id": 5
   * }
   * @returns {Promise<Object>} Account settings
   */
  getSettings() {
    return this.send({
      get_settings: 1
    });
  }

  /**
   * Set account settings
   * Example:
   * {
   *   "set_settings": 1,
   *   "email_consent": 1,
   *   "req_id": 6
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
   * Get account limits
   * Example:
   * {
   *   "get_limits": 1,
   *   "req_id": 7
   * }
   * @returns {Promise<Object>} Account limits
   */
  getLimits() {
    return this.send({
      get_limits: 1
    });
  }

  /**
   * Get self-exclusion settings
   * Example:
   * {
   *   "get_self_exclusion": 1,
   *   "req_id": 8
   * }
   * @returns {Promise<Object>} Self-exclusion settings
   */
  getSelfExclusion() {
    return this.send({
      get_self_exclusion: 1
    });
  }

  /**
   * Set self-exclusion settings
   * Example:
   * {
   *   "set_self_exclusion": 1,
   *   "max_losses": 100000,
   *   "req_id": 9
   * }
   * @param {Object} params Self-exclusion parameters
   * @returns {Promise<Object>} Update response
   */
  setSelfExclusion(params) {
    return this.send({
      set_self_exclusion: 1,
      ...params
    });
  }

  /**
   * Get account currencies
   * Example:
   * {
   *   "payout_currencies": 1,
   *   "req_id": 10
   * }
   * @returns {Promise<Object>} Account currencies
   */
  getPayoutCurrencies() {
    return this.send({
      payout_currencies: 1
    });
  }

  /**
   * Get available currencies
   * Example:
   * {
   *   "landing_company": "costarica",
   *   "req_id": 11
   * }
   * @param {string} landingCompany Landing company
   * @returns {Promise<Object>} Available currencies
   */
  getLandingCompany(landingCompany) {
    if (!landingCompany) {
      throw new Error('Landing company is required');
    }

    return this.send({
      landing_company: landingCompany
    });
  }

  /**
   * Get landing company details
   * Example:
   * {
   *   "landing_company_details": "costarica",
   *   "req_id": 12
   * }
   * @param {string} landingCompany Landing company
   * @returns {Promise<Object>} Landing company details
   */
  getLandingCompanyDetails(landingCompany) {
    if (!landingCompany) {
      throw new Error('Landing company is required');
    }

    return this.send({
      landing_company_details: landingCompany
    });
  }

  /**
   * Get states list
   * Example:
   * {
   *   "states_list": "us",
   *   "req_id": 13
   * }
   * @param {string} countryCode Country code
   * @returns {Promise<Object>} States list
   */
  getStatesList(countryCode) {
    if (!countryCode) {
      throw new Error('Country code is required');
    }

    return this.send({
      states_list: countryCode
    });
  }

  /**
   * Get financial assessment
   * Example:
   * {
   *   "get_financial_assessment": 1,
   *   "req_id": 14
   * }
   * @returns {Promise<Object>} Financial assessment
   */
  getFinancialAssessment() {
    return this.send({
      get_financial_assessment: 1
    });
  }

  /**
   * Set financial assessment
   * Example:
   * {
   *   "set_financial_assessment": 1,
   *   "education_level": "Secondary",
   *   "req_id": 15
   * }
   * @param {Object} params Assessment parameters
   * @returns {Promise<Object>} Update response
   */
  setFinancialAssessment(params) {
    return this.send({
      set_financial_assessment: 1,
      ...params
    });
  }

  /**
   * Get identity verification status
   * Example:
   * {
   *   "identity_verification_document_add": 1,
   *   "req_id": 16
   * }
   * @returns {Promise<Object>} Verification status
   */
  getIdentityVerificationStatus() {
    return this.send({
      identity_verification_document_add: 1
    });
  }

  /**
   * Get account types
   * Example:
   * {
   *   "get_account_types": 1,
   *   "req_id": 17
   * }
   * @returns {Promise<Object>} Account types
   */
  getAccountTypes() {
    return this.send({
      get_account_types: 1
    });
  }
}
