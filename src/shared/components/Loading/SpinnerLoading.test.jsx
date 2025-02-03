import { describe, it, expect } from 'vitest';
import { renderWithContainer, screen } from '@/test/test-utils';
import { SpinnerLoading } from './SpinnerLoading';

describe('SpinnerLoading', () => {
  it('renders spinner with default size', () => {
    renderWithContainer(<SpinnerLoading />);
    const spinner = screen.getByRole('status').querySelector('div');
    expect(spinner.className).toContain('spinner');
    expect(spinner.className).toContain('medium');
  });

  it('renders spinner with small size', () => {
    renderWithContainer(<SpinnerLoading size="sm" />);
    const spinner = screen.getByRole('status').querySelector('div');
    expect(spinner.className).toContain('small');
  });

  it('renders spinner with large size', () => {
    renderWithContainer(<SpinnerLoading size="lg" />);
    const spinner = screen.getByRole('status').querySelector('div');
    expect(spinner.className).toContain('large');
  });

  it('renders loading text when provided', () => {
    renderWithContainer(<SpinnerLoading text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not render text when not provided', () => {
    renderWithContainer(<SpinnerLoading />);
    const container = screen.getByRole('status');
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('renders three dots for animation', () => {
    renderWithContainer(<SpinnerLoading />);
    const dots = screen.getByRole('status')
      .querySelector('[class*="spinner"]')
      .querySelectorAll('[class*="dot"]');
    expect(dots).toHaveLength(3);
  });

  it('applies correct class names', () => {
    renderWithContainer(<SpinnerLoading text="Loading..." />);
    const container = screen.getByRole('status');
    expect(container.className).toContain('loadingContainer');
    expect(container.querySelector('p').className).toContain('text');
  });

  it('has correct accessibility attributes', () => {
    renderWithContainer(<SpinnerLoading text="Loading..." />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });
});
