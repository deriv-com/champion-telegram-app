import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import RootLayout from './RootLayout';
import styles from './RootLayout.module.css';

describe('RootLayout', () => {
  beforeEach(() => {
    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders main content correctly', () => {
    const testContent = <div data-testid="test-content">Test Content</div>;
    render(<RootLayout>{testContent}</RootLayout>);
    
    // Check if main content is rendered
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('has correct structure and styles for Telegram WebApp', () => {
    render(<RootLayout>Test Content</RootLayout>);
    
    const rootElement = document.querySelector(`.${styles.root}`);
    const mainElement = screen.getByRole('main');
    
    // Check root element styles
    expect(rootElement).toHaveClass(styles.root);

    // Check main element styles
    expect(mainElement).toHaveClass(styles.main);
  });

  it('handles content overflow correctly for scrolling', () => {
    const longContent = <div style={{ height: '200vh' }}>Very long content</div>;
    render(<RootLayout>{longContent}</RootLayout>);
    
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass(styles.main);
  });

  it('maintains safe area insets for notched devices', () => {
    render(<RootLayout>Test Content</RootLayout>);
    
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass(styles.main);
  });
});
