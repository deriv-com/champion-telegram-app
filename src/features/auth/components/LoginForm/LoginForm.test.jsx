import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../../../test/test-utils';
import LoginForm from './LoginForm';
import { ROUTES } from '../../../../config/routes.config';

// Mock useTelegram hook
const mockUseTelegram = vi.fn();
vi.mock('../../../../hooks/useTelegram', () => ({
  useTelegram: () => mockUseTelegram()
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    // Default to no user
    mockUseTelegram.mockReturnValue({
      webApp: {
        initDataUnsafe: {
          user: null
        }
      }
    });
  });

  it('renders welcome message and instructions', async () => {
    renderWithRouter(<LoginForm />);
    
    expect(screen.getByText(/welcome to champion trade/i)).toBeInTheDocument();
    expect(screen.getByText(/please open this app through telegram/i)).toBeInTheDocument();
  });

  it('redirects to dashboard when Telegram user data is present', async () => {
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

    renderWithRouter(<LoginForm />);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });
});
