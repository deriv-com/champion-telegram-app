import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing-library
configure({ 
  testIdAttribute: 'data-testid',
});

// Make vi available globally for all tests
globalThis.vi = vi;

// Override environment variables for testing
vi.stubEnv('VITE_API_BASE_URL', 'http://test-api.example.com');
vi.stubEnv('VITE_WS_URL', 'ws://test-ws.example.com');
vi.stubEnv('VITE_ENCRYPTION_KEY', 'test-encryption-key');
vi.stubEnv('VITE_DERIV_OAUTH_URL', 'http://test-oauth.example.com');
vi.stubEnv('VITE_DERIV_SIGNUP_URL', 'http://test-signup.example.com');

// Mock CSS modules
vi.mock('*.module.css', () => {
  return new Proxy({}, {
    get: (_, prop) => prop,
  });
});

// Mock auth service
vi.mock('@/services/auth.service', () => ({
  authService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    isAuthenticated: vi.fn().mockReturnValue(false),
    getSession: vi.fn().mockReturnValue(null),
    clearSession: vi.fn(),
    getTradingAccounts: vi.fn().mockResolvedValue([
      { account: 'ACC123', currency: 'USD' },
      { account: 'ACC456', currency: 'EUR' }
    ]),
  },
}));

// Configure React to use legacy mode for tests
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useLayoutEffect: actual.useEffect,
  };
});

// Setup test environment
beforeAll(() => {
  // Create a root div for React to render into
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);

  // Mock window properties
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
