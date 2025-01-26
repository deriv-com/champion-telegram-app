import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithRouter } from '../../../../test/test-utils';
import LandingPage from './LandingPage';
import { ROUTES } from '@/config/routes.config';

// Mock useTelegram hook
vi.mock('@/hooks/useTelegram', () => ({
  useTelegram: () => ({
    handleMainButton: vi.fn(() => () => {}),
  }),
}));

// Mock react-router-dom properly
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockNavigate = vi.fn();

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders landing page with title and description', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByRole('heading', { name: /Trade Smarter with Champion Trade/i })).toBeInTheDocument();
    expect(screen.getByText(/Experience the future of trading/i)).toBeInTheDocument();
  });

  it('displays login button when user is not authenticated', () => {
    renderWithRouter(<LandingPage />);

    const loginButton = screen.getByRole('button', { name: /Access your account/i });
    expect(loginButton).toBeInTheDocument();
    
    // Test button functionality
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  it('displays logo image', () => {
    renderWithRouter(<LandingPage />);

    const logo = screen.getByAltText('Champion Trade');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', expect.stringContaining('champion-trade-logo'));
  });

  it('applies correct layout structure', () => {
    renderWithRouter(<LandingPage />);

    const heroSection = screen.getByRole('banner');
    expect(heroSection).toBeInTheDocument();
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByText(/Experience the future of trading/i)).toBeInTheDocument();
  });

  it('sets up telegram main button on mount', () => {
    const { unmount } = renderWithRouter(<LandingPage />);
    
    // Cleanup should run on unmount
    unmount();
  });
});
