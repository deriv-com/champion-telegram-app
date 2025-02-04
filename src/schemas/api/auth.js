import { API_METHODS } from './base.js';

/**
 * @typedef {import('./base.js').ApiCategory} ApiCategory
 */

/**
 * Auth API Registry
 * @type {ApiCategory}
 */
export const AuthApiRegistry = {
  name: 'auth',
  description: 'Authentication and authorization',
  endpoints: {
    authorize: {
      name: 'Authorize',
      description: 'Authorize using token',
      method: 'authorize',
      requestSchema: {
        type: 'object',
        properties: {
          authorize: { type: 'string' }
        },
        required: ['authorize']
      },
      responseSchema: {
        type: 'object',
        properties: {
          authorize: {
            type: 'object',
            properties: {
              account_list: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    account_category: { type: 'string' },
                    account_type: { type: 'string' },
                    broker: { type: 'string' },
                    created_at: { type: 'number' },
                    currency: { type: 'string' },
                    currency_type: { type: 'string' },
                    is_disabled: { type: 'number' },
                    is_virtual: { type: 'number' },
                    landing_company_name: { type: 'string' },
                    linked_to: { type: 'array', items: { type: 'string' } },
                    loginid: { type: 'string' }
                  },
                  required: ['account_type', 'currency', 'is_disabled', 'is_virtual', 'loginid']
                }
              },
              balance: { type: 'number' },
              country: { type: 'string' },
              currency: { type: 'string' },
              email: { type: 'string' },
              fullname: { type: 'string' },
              is_virtual: { type: 'number' },
              landing_company_fullname: { type: 'string' },
              landing_company_name: { type: 'string' },
              linked_to: { type: 'array', items: { type: 'string' } },
              local_currencies: {
                type: 'object',
                additionalProperties: {
                  type: 'object',
                  properties: {
                    fractional_digits: { type: 'number' }
                  }
                }
              },
              loginid: { type: 'string' },
              preferred_language: { type: 'string' },
              scopes: { type: 'array', items: { type: 'string' } },
              upgradeable_landing_companies: { type: 'array', items: { type: 'string' } },
              user_id: { type: 'number' }
            },
            required: [
              'account_list',
              'balance',
              'currency',
              'email',
              'is_virtual',
              'landing_company_name',
              'loginid',
              'user_id'
            ]
          }
        },
        required: ['authorize']
      }
    },
    balance: {
      name: 'Balance',
      description: 'Subscribe to real-time account balance updates. This is a subscription-based endpoint that provides continuous balance updates.',
      method: 'balance',
      isSubscription: true,
      requestSchema: {
        type: 'object',
        properties: {
          balance: { type: 'number', enum: [1] },
          subscribe: { type: 'number', enum: [1] }
        },
        required: ['balance', 'subscribe']
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
            required: ['balance', 'currency', 'id', 'loginid']
          },
          subscription: {
            type: 'object',
            properties: {
              id: { type: 'string' }
            },
            required: ['id']
          }
        },
        required: ['balance', 'subscription']
      }
    },
    accountStatus: {
      name: 'Account Status',
      description: 'Get account status',
      method: 'get_account_status',
      requestSchema: {
        type: 'object',
        properties: {
          get_account_status: { type: 'number', enum: [1] }
        },
        required: ['get_account_status']
      },
      responseSchema: {
        type: 'object',
        properties: {
          get_account_status: {
            type: 'object',
            properties: {
              status: { type: 'array', items: { type: 'string' } }
            },
            required: ['status']
          }
        },
        required: ['get_account_status']
      }
    },
    settings: {
      name: 'Account Settings',
      description: 'Get account settings',
      method: 'get_settings',
      requestSchema: {
        type: 'object',
        properties: {
          get_settings: { type: 'number', enum: [1] }
        },
        required: ['get_settings']
      },
      responseSchema: {
        type: 'object',
        properties: {
          get_settings: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              currency: { type: 'string' }
            },
            required: ['email', 'currency']
          }
        },
        required: ['get_settings']
      }
    },
    setSettings: {
      name: 'Set Account Settings',
      description: 'Update account settings',
      method: 'set_settings',
      requestSchema: {
        type: 'object',
        properties: {
          set_settings: { type: 'number', enum: [1] }
        },
        required: ['set_settings']
      },
      responseSchema: {
        type: 'object',
        properties: {
          set_settings: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              currency: { type: 'string' }
            }
          }
        },
        required: ['set_settings']
      }
    },
    logout: {
      name: 'Logout',
      description: 'Logout from the session',
      method: 'logout',
      requestSchema: {
        type: 'object',
        properties: {
          logout: { type: 'number', enum: [1] }
        },
        required: ['logout']
      },
      responseSchema: {
        type: 'object',
        properties: {
          logout: { type: 'number', enum: [1] }
        },
        required: ['logout']
      }
    },
    ping: {
      name: 'Ping',
      description: 'Keep connection alive',
      method: 'ping',
      requestSchema: {
        type: 'object',
        properties: {
          ping: { type: 'number', enum: [1] }
        },
        required: ['ping']
      },
      responseSchema: {
        type: 'object',
        properties: {
          ping: { type: 'string' }
        },
        required: ['ping']
      }
    },
    time: {
      name: 'Server Time',
      description: 'Get server time',
      method: 'time',
      requestSchema: {
        type: 'object',
        properties: {
          time: { type: 'number', enum: [1] }
        },
        required: ['time']
      },
      responseSchema: {
        type: 'object',
        properties: {
          time: { type: 'number' }
        },
        required: ['time']
      }
    },
    websiteStatus: {
      name: 'Website Status',
      description: 'Get website status',
      method: 'website_status',
      requestSchema: {
        type: 'object',
        properties: {
          website_status: { type: 'number', enum: [1] }
        },
        required: ['website_status']
      },
      responseSchema: {
        type: 'object',
        properties: {
          website_status: {
            type: 'object',
            properties: {
              site_status: { type: 'string' },
              message: { type: 'string' }
            },
            required: ['site_status']
          }
        },
        required: ['website_status']
      }
    }
  }
};
