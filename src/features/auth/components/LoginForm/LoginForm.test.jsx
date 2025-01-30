import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';
import LoginForm from './LoginForm';
import { ROUTES } from '@/config/routes.config';
import { vi } from 'vitest';
import { useNavigate } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

// Mock hooks
const mockTelegramUser = { id: 123456789, username: 'testuser' };
let mockIsLoading = false;
let mockIsAuthenticated = false;
let mockWebAppUser = null;

vi.mock('@/hooks', () => ({
  useTelegram: () => ({
    webApp: {
      initDataUnsafe: {
        user: mockWebAppUser
      }
    }
  }),
  useAuth: () => ({
    login: mockLogin,
    isLoading: mockIsLoading,
    isAuthenticated: mockIsAuthenticated
  })
}));

// Mock router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: actual.MemoryRouter
  };
});

// Mock app config
vi.mock('@/config/app.config', () => ({
  APP_CONFIG: {
    telegram: {
      botToken: 'mock-token',
      validateInitData: () => true
    }
  }
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebAppUser = null;
    mockIsLoading = false;
    mockIsAuthenticated = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows telegram message when not accessed through telegram', () => {
    renderWithRouter(<LoginForm />);
    expect(screen.getByText(/please open this app through telegram/i)).toBeInTheDocument();
  });

  it('shows loading state while authenticating', () => {
    mockIsLoading = true;
    renderWithRouter(<LoginForm />);
    expect(screen.getByText(/preparing your trading dashboard/i)).toBeInTheDocument();
  });

  it('attempts login with telegram user data', async () => {
    mockWebAppUser = mockTelegramUser;
    renderWithRouter(<LoginForm />);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockTelegramUser);
    });
  });

  it('redirects to dashboard after successful authentication', async () => {
    mockWebAppUser = mockTelegramUser;
    mockIsAuthenticated = true;
    renderWithRouter(<LoginForm />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });
  });
});
