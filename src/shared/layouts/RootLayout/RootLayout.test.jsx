import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithContainer, screen, waitFor } from '@/test/test-utils';
import { act } from '@testing-library/react';
import RootLayout from './RootLayout';
import styles from './RootLayout.module.css';

describe('RootLayout', () => {
  const mockMatchMedia = (matches) => {
    const listeners = new Set();
    return {
      matches,
      addEventListener: (_, listener) => listeners.add(listener),
      removeEventListener: (_, listener) => listeners.delete(listener),
      dispatchChange: (matches) => {
        listeners.forEach(listener => listener({ matches }));
      },
    };
  };

  let originalMatchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  it('handles errors with ErrorBoundary', () => {
    window.matchMedia = vi.fn().mockImplementation(() => mockMatchMedia(false));
    
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ThrowError = () => { throw new Error('Test error'); };
    
    renderWithContainer(
      <RootLayout>
        <ThrowError />
      </RootLayout>
    );
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    errorSpy.mockRestore();
  });

  it('handles responsive layout', async () => {
    const mediaQuery = mockMatchMedia(false);
    window.matchMedia = vi.fn().mockImplementation(() => mediaQuery);
    
    renderWithContainer(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    
    const rootDiv = screen.getByRole('main').parentElement;
    expect(rootDiv.className).toContain(styles.root);
    expect(rootDiv.className).not.toContain(styles.mobile);

    // Test mobile view
    await act(async () => {
      mediaQuery.dispatchChange(true);
    });
    
    await waitFor(() => {
      expect(rootDiv.className).toContain(styles.mobile);
    });
  });
});
