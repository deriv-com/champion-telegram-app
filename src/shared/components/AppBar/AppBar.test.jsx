import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithRouter, screen, fireEvent } from '@/test/test-utils';
import AppBar from './AppBar';
import { useTelegram, useAuth } from '@/hooks';
import { APP_CONFIG } from '@/config/app.config';
import styles from './AppBar.module.css';

// Mock hooks
vi.mock('@/hooks', () => ({
  useTelegram: vi.fn(),
  useAuth: vi.fn()
}));

// Mock config
vi.mock('@/config/app.config', () => ({
  APP_CONFIG: {
    environment: {
      isDevelopment: false
    }
  }
}));

describe('AppBar', () => {
  const defaultProps = {
    accountId: 'ACC123',
    balance: '1000',
    currency: 'USD'
  };

  const mockShowConfirm = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset development mode
    APP_CONFIG.environment.isDevelopment = false;
    
    // Default mock implementations
    useTelegram.mockReturnValue({
      webApp: {},
      showConfirm: mockShowConfirm
    });

    useAuth.mockReturnValue({
      logout: mockLogout,
      isLoading: false
    });
  });

  it('renders account details when not loading', () => {
    renderWithRouter(<AppBar {...defaultProps} />);
    const accountDetails = screen.getByTestId('account-details');
    expect(accountDetails).toHaveTextContent('ACC123');
    expect(accountDetails).toHaveTextContent('USD 1000');
  });

  it('toggles dropdown on click', () => {
    renderWithRouter(<AppBar {...defaultProps} />);
    
    const accountInfo = screen.getByTestId('account-info');
    expect(accountInfo.className).not.toContain(styles.active);
    
    fireEvent.click(accountInfo);
    expect(accountInfo.className).toContain(styles.active);
    
    fireEvent.click(accountInfo);
    expect(accountInfo.className).not.toContain(styles.active);
  });

  it('shows confirmation dialog before logout', async () => {
    mockShowConfirm.mockResolvedValueOnce(true);
    mockLogout.mockResolvedValueOnce(true);

    renderWithRouter(<AppBar {...defaultProps} />);
    
    // Open dropdown and click logout
    fireEvent.click(screen.getByTestId('account-info'));
    const logoutButton = screen.getByTestId('logout-button');
    
    fireEvent.click(logoutButton);
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(mockShowConfirm).toHaveBeenCalledWith('Are you sure you want to logout?');
    expect(mockLogout).toHaveBeenCalled();
  });
});
