import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Custom render function that includes router context
export function renderWithRouter(ui, { route = '/', ...renderOptions } = {}) {
  window.history.pushState({}, 'Test page', route);

  return render(ui, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    ...renderOptions,
  });
}

// Mock Telegram WebApp functions
export const mockTelegramWebApp = {
  ready: vi.fn(),
  expand: vi.fn(),
  close: vi.fn(),
  MainButton: {
    show: vi.fn(),
    hide: vi.fn(),
    setText: vi.fn(),
    onClick: vi.fn(),
    offClick: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
  },
  BackButton: {
    show: vi.fn(),
    hide: vi.fn(),
    onClick: vi.fn(),
    offClick: vi.fn(),
  },
  initData: 'mock-init-data',
  initDataUnsafe: {
    user: {
      id: 123456789,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
    },
  },
};

// Mock handleMainButton function
export const mockHandleMainButton = ({ text, callback }) => {
  mockTelegramWebApp.MainButton.setText(text);
  mockTelegramWebApp.MainButton.onClick(callback);
  return () => mockTelegramWebApp.MainButton.offClick(callback);
};

// Mock localStorage
export class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

// Setup global test utilities
export const setupTestUtils = () => {
  beforeEach(() => {
    // Mock localStorage
    global.localStorage = new LocalStorageMock();
    
    // Mock Telegram WebApp
    global.window.Telegram = {
      WebApp: mockTelegramWebApp,
    };
  });

  afterEach(() => {
    // Clean up
    vi.clearAllMocks();
    localStorage.clear();
    delete global.window.Telegram;
  });
};

// Run setup
setupTestUtils();
