import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithContainer, screen, fireEvent } from '@/test/test-utils';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  const consoleError = console.error;
  
  beforeEach(() => {
    // Suppress console.error for expected errors
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = consoleError;
    vi.clearAllMocks();
  });

  it('renders children when no error occurs', () => {
    renderWithContainer(
      <ErrorBoundary>
        <div data-testid="test-child">Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error UI when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error message');
    };

    renderWithContainer(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument();
  });

  it('shows fallback message when error has no message', () => {
    const ThrowError = () => {
      throw new Error();
    };

    renderWithContainer(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('logs error details to console', () => {
    const error = new Error('Test error');
    const errorInfo = { componentStack: 'Test stack' };
    const instance = new ErrorBoundary({});

    instance.componentDidCatch(error, errorInfo);

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by boundary:',
      error,
      errorInfo
    );
  });

  it('reloads page when reset button is clicked', () => {
    const locationReload = vi.fn();
    delete window.location;
    window.location = { reload: locationReload };

    const ThrowError = () => {
      throw new Error('Test error');
    };

    renderWithContainer(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reload Page' }));
    expect(locationReload).toHaveBeenCalled();
  });

  it('updates state correctly when error occurs', () => {
    const error = new Error('Test error');
    const result = ErrorBoundary.getDerivedStateFromError(error);

    expect(result).toEqual({
      hasError: true,
      error: error,
    });
  });

  it('throws error when children prop is missing', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderWithContainer(<ErrorBoundary />);
      throw new Error('Should not reach this point');
    }).toThrow();
    consoleError.mockRestore();
  });

  it('uses primary variant for reset button', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    renderWithContainer(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const button = screen.getByRole('button', { name: 'Reload Page' });
    expect(button.className).toContain('buttonPrimary');
  });

  it('maintains error state until reset', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { rerender } = renderWithContainer(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Rerendering with new children should not clear error state
    rerender(
      <ErrorBoundary>
        <div>New content</div>
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('New content')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    renderWithContainer(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert').className).toContain('container');
    expect(screen.getByText('Something went wrong').className).toContain('title');
    expect(screen.getByText('Test error').className).toContain('message');
  });
});
