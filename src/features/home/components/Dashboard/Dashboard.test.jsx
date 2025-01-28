import { screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../../test/test-utils';
import Dashboard from './Dashboard';
import { vi, expect } from 'vitest';
import { tradeIcon, cashierIcon, positionsIcon } from '@/assets/images';

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
  });

  const TAB_ITEMS = [
    { id: 'trade', icon: tradeIcon, label: 'Trade' },
    { id: 'cashier', icon: cashierIcon, label: 'Cashier' },
    { id: 'positions', icon: positionsIcon, label: 'Positions' }
  ];

  it('renders dashboard with tab navigation', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByRole('tab', { name: /trade/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /cashier/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /positions/i })).toBeInTheDocument();
  });

  it('shows trade view by default', () => {
    renderWithRouter(<Dashboard />);
    
    const tradeTab = screen.getByRole('tab', { name: /trade/i });
    expect(tradeTab.className).toContain('active');
    expect(screen.getByTestId('trade-view')).toBeInTheDocument();
  });

  it('verifies tab items are rendered with correct icons', () => {
    renderWithRouter(<Dashboard />);
    
    TAB_ITEMS.forEach(item => {
      const tab = screen.getByRole('tab', { name: item.label });
      const icon = tab.querySelector('img');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', item.icon);
    });
  });

  it('shows trade view for invalid tab state', async () => {
    const { rerender } = renderWithRouter(<Dashboard />);
    
    // Force an invalid tab state
    const DashboardWithProps = () => {
      return <Dashboard defaultTab="invalid-tab" />;
    };
    
    rerender(<DashboardWithProps />);
    expect(screen.getByTestId('trade-view')).toBeInTheDocument();
  });

  it('switches between tabs when clicked', async () => {
    await act(async () => {
      renderWithRouter(<Dashboard />);
    });
    const user = userEvent.setup();
    
    // Initial state check
    expect(screen.getByTestId('trade-view')).toBeInTheDocument();
    
    // Switch to Cashier tab
    const cashierTab = screen.getByRole('tab', { name: /cashier/i });
    await act(async () => {
      await user.click(cashierTab);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('cashier-view')).toBeInTheDocument();
      expect(cashierTab.className).toContain('active');
    });

    // Switch to Positions tab
    const positionsTab = screen.getByRole('tab', { name: /positions/i });
    await act(async () => {
      await user.click(positionsTab);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('positions-view')).toBeInTheDocument();
      expect(positionsTab.className).toContain('active');
    });
  });
});
