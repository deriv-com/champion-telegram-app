import { screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../../test/test-utils';
import Dashboard from './Dashboard';
import { vi, expect } from 'vitest';
import { tradeIcon, cashierIcon, positionsIcon } from '@/assets/images';
import { useAuth } from '@/hooks';

// Mock hooks
vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
  useTelegram: () => ({
    webApp: {},
    showConfirm: vi.fn()
  })
}));

// Mock child components
vi.mock('@/features/trade', () => ({
  TradeView: () => <div data-testid="trade-view">Trade View</div>
}));

vi.mock('@/features/cashier', () => ({
  CashierView: () => <div data-testid="cashier-view">Cashier View</div>
}));

vi.mock('@/features/positions', () => ({
  PositionsView: () => <div data-testid="positions-view">Positions View</div>
}));
// Mock assets to avoid import issues in tests
vi.mock('@/assets/images', () => ({
  tradeIcon: '/mock-trade-icon.svg',
  cashierIcon: '/mock-cashier-icon.svg',
  positionsIcon: '/mock-positions-icon.svg'
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock default auth state
    useAuth.mockImplementation(() => ({
      accountId: '12345',
      balance: 1000,
      currency: 'USD',
      isLoading: false
    }));
  });

  const TAB_ITEMS = [
    { id: 'trade', icon: tradeIcon, label: 'Trade' },
    { id: 'cashier', icon: cashierIcon, label: 'Cashier' },
    { id: 'positions', icon: positionsIcon, label: 'Positions' }
  ];

  it('handles tab navigation', async () => {
    await act(async () => {
      renderWithRouter(<Dashboard />);
    });
    const user = userEvent.setup();
    
    // Check default view
    const tradeTab = screen.getByRole('tab', { name: /trade/i });
    expect(tradeTab.className).toContain('active');
    expect(screen.getByTestId('trade-view')).toBeInTheDocument();
    
    // Test tab switching
    const cashierTab = screen.getByRole('tab', { name: /cashier/i });
    await act(async () => {
      await user.click(cashierTab);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('cashier-view')).toBeInTheDocument();
      expect(cashierTab.className).toContain('active');
    });
  });
});
