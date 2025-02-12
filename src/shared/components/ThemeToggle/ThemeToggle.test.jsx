import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

// Mock the useTelegram hook
jest.mock('@/hooks/useTelegram', () => ({
  useTelegram: () => ({
    haptic: {
      impact: jest.fn()
    },
    webApp: null
  })
}));

describe('ThemeToggle', () => {
  const renderToggle = (props = {}) => {
    return render(
      <ThemeProvider>
        <ThemeToggle {...props} />
      </ThemeProvider>
    );
  };

  it('renders correctly', () => {
    renderToggle();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('toggles theme on click', () => {
    renderToggle();
    const toggle = screen.getByRole('button');
    
    // Initial theme is light
    expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');
    
    // Click to toggle
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
  });

  it('applies size classes correctly', () => {
    const { rerender } = renderToggle();
    const toggle = screen.getByRole('button');

    // Default (md) size
    expect(toggle.className).not.toMatch(/sm|lg/);

    // Small size
    rerender(
      <ThemeProvider>
        <ThemeToggle size="sm" />
      </ThemeProvider>
    );
    expect(toggle.className).toMatch(/sm/);

    // Large size
    rerender(
      <ThemeProvider>
        <ThemeToggle size="lg" />
      </ThemeProvider>
    );
    expect(toggle.className).toMatch(/lg/);
  });

  it('disables toggle when Telegram theme is enforced', () => {
    // Mock useTelegram to return a webApp with colorScheme
    jest.spyOn(require('@/hooks/useTelegram'), 'useTelegram').mockImplementation(() => ({
      haptic: { impact: jest.fn() },
      webApp: { colorScheme: 'dark' }
    }));

    renderToggle();
    const toggle = screen.getByRole('button');
    expect(toggle).toBeDisabled();
  });
});
