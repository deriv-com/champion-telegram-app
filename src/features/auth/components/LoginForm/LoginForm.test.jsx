import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';
import LoginForm from './LoginForm';
import { ROUTES } from '@/config/routes.config';
import { useTelegram } from '@/hooks/useTelegram';
import { useLoading } from '@/hooks/useLoading';
import { authService } from '@/services/auth.service';
import { APP_CONFIG } from '@/config/app.config';

// Mock implementations must be defined before vi.mock() calls
vi.mock('@/hooks/useTelegram', () => ({
  useTelegram: vi.fn()
}));

vi.mock('@/hooks/useLoading', () => ({
  useLoading: vi.fn()
}));

vi.mock('@/services/auth.service', () => ({
  authService: {
    setSession: vi.fn(),
    createTestSession: vi.fn(),
    getStoredSession: vi.fn(),
    validateSession: vi.fn(),
    clearSession: vi.fn()
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('@/config/app.config', () => ({
  APP_CONFIG: {
    environment: {
      isDevelopment: false
    }
  }
}));

const mockNavigate = vi.fn();
const mockWithLoading = vi.fn((cb) => cb());

beforeAll(() => {
  useTelegram.mockImplementation(() => ({
    webApp: {
      initDataUnsafe: {
        user: null
      }
    }
  }));

  useLoading.mockImplementation(() => ({
    isLoading: false,
    withLoading: mockWithLoading
  }));
});

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    // Default to no user
    useTelegram.mockImplementation(() => ({
      webApp: {
        initDataUnsafe: {
          user: null
        }
      }
    }));
  });

  it('renders welcome message and instructions when no user data is present', async () => {
    authService.getStoredSession.mockResolvedValue(null);
    
    renderWithRouter(<LoginForm />);
    
    await waitFor(() => {
      expect(screen.getByText(/welcome to champion trade/i)).toBeInTheDocument();
      expect(screen.getByText(/please open this app through telegram/i)).toBeInTheDocument();
    });
    
    expect(authService.clearSession).toHaveBeenCalled();
  });

  it('redirects to dashboard when Telegram user data is present', async () => {
    const mockUser = {
      id: 123456789,
      username: 'testuser'
    };
    
    useTelegram.mockImplementation(() => ({
      webApp: {
        initDataUnsafe: {
          user: mockUser
        }
      }
    }));

    renderWithRouter(<LoginForm />);

    await waitFor(() => {
      expect(authService.setSession).toHaveBeenCalledWith(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });
  });

  it('redirects to dashboard when valid stored session exists', async () => {
    const storedSession = { token: 'valid-token' };
    authService.getStoredSession.mockResolvedValue(storedSession);
    authService.validateSession.mockResolvedValue(true);

    renderWithRouter(<LoginForm />);

    await waitFor(() => {
      expect(authService.validateSession).toHaveBeenCalledWith(storedSession);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });
  });

  it('clears session when stored session is invalid', async () => {
    const storedSession = { token: 'invalid-token' };
    authService.getStoredSession.mockResolvedValue(storedSession);
    authService.validateSession.mockResolvedValue(false);

    renderWithRouter(<LoginForm />);

    await waitFor(() => {
      expect(authService.validateSession).toHaveBeenCalledWith(storedSession);
      expect(authService.clearSession).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
