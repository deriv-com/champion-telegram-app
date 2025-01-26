import { expect, afterEach, vi } from 'vitest';

// Make vi available globally for all tests
globalThis.vi = vi;
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// Extend Vitest's expect with Testing Library's matchers
expect.extend({});
