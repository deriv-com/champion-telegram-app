import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '../Button';

// Mock Button component to avoid any potential issues
vi.mock('../Button', () => ({
  Button: ({ children, onClick, variant }) => (
    <button onClick={onClick} data-variant={variant}>{children}</button>
  )
}));

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  // Mock console.error to avoid test noise
  const originalError = console.error;
  
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    // Clear mocks and reset console.error mock between tests
    vi.clearAllMocks();
    console.error.mockClear();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it('provides a way to reload the page', () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText(/reload page/i));
    expect(mockReload).toHaveBeenCalled();
  });
});
