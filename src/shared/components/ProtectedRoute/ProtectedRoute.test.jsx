import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import { MemoryRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from '@/config/routes.config';

// Mock useTelegram hook
const mockUseTelegram = vi.fn();
vi.mock('@/hooks/useTelegram', () => ({
  useTelegram: () => mockUseTelegram()
}));

// Mock Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>
  };
});

// Mock components
const MockProtectedComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to no user (unauthenticated)
    mockUseTelegram.mockReturnValue({
      webApp: {
        initDataUnsafe: {
          user: null
        }
      }
    });
  });

  it('redirects to home when no Telegram user data is present', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <MockProtectedComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should show redirecting message
    expect(screen.getByText(/redirecting/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders protected content when Telegram user data is present', () => {
    // Mock authenticated Telegram user
    mockUseTelegram.mockReturnValue({
      webApp: {
        initDataUnsafe: {
          user: {
            id: 123456789,
            username: 'testuser'
          }
        }
      }
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <MockProtectedComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should show protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText(/redirecting/i)).not.toBeInTheDocument();
  });

  it('renders nested routes when Telegram user data is present', () => {
    // Mock authenticated Telegram user
    mockUseTelegram.mockReturnValue({
      webApp: {
        initDataUnsafe: {
          user: {
            id: 123456789,
            username: 'testuser'
          }
        }
      }
    });
    
    const NestedComponent = () => <div>Nested Content</div>;

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>
            <MockProtectedComponent />
            <NestedComponent />
          </div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should show both parent and nested content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.getByText('Nested Content')).toBeInTheDocument();
    expect(screen.queryByText(/redirecting/i)).not.toBeInTheDocument();
  });
});
