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

  it('renders landing page and handles navigation', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByRole('heading', { name: /Trade Smarter with Champion Trade/i })).toBeInTheDocument();
    
    const loginButton = screen.getByRole('button', { name: /Get started/i });
    expect(loginButton).toBeInTheDocument();
    
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
  });
});
