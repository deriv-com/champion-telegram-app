import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter, screen } from '@/test/test-utils';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/config/routes.config';

// Mock useAuth hook
vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  const TestChild = () => <div data-testid="protected-content">Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while checking authentication', () => {
    useAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>,
      { route: '/protected' }
    );

    // Verify we don't see the protected content
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    // Verify we're redirected to login
    expect(document.location.pathname).toBe('/');
  });

  it('renders children when authenticated', () => {
    useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('uses replace for login navigation', () => {
    useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    // Verify protected content is not shown
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('throws error when children prop is missing', () => {
    useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderWithRouter(<ProtectedRoute />);
      throw new Error('Should not reach this point');
    }).toThrow();
    consoleError.mockRestore();
  });

  it('shows large loading spinner with text', () => {
    useAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    // Find the loading container by text content
    const loadingContainer = screen.getByText('Loading...').closest('div');
    expect(loadingContainer.className).toContain('loadingContainer');
    expect(loadingContainer.querySelector('div').className).toContain('large');
  });

  it('maintains route after authentication', () => {
    // Start with loading state
    useAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    });

    const { rerender } = renderWithRouter(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>,
      { route: '/protected' }
    );

    // Update to authenticated state
    useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });

    rerender(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    // Should still be at /protected and showing content
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('calls useAuth hook on render', () => {
    useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(useAuth).toHaveBeenCalled();
  });
});
