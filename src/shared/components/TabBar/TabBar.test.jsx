import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithRouter } from '../../../test/test-utils';
import TabBar from './TabBar';
import styles from './TabBar.module.css';

vi.mock('./TabBar.module.css', () => ({
  default: {
    tabBar: 'tabBar_123',
    tabButton: 'tabButton_123',
    active: 'active_123'
  }
}));

describe('TabBar', () => {
  const mockItems = [
    { id: 'trade', icon: '/mock-trade-icon.svg', label: 'Trade' },
    { id: 'positions', icon: '/mock-positions-icon.svg', label: 'Positions' },
    { id: 'cashier', icon: '/mock-cashier-icon.svg', label: 'Cashier' }
  ];
  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tab items', () => {
    renderWithRouter(
      <TabBar
        items={mockItems}
        activeTab="trade"
        onTabChange={mockOnTabChange}
      />
    );

    // Check if all labels are rendered
    mockItems.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });

    // Check if all icons are rendered
    mockItems.forEach(item => {
      const tab = screen.getByRole('tab', { name: item.label });
      const icon = tab.querySelector('img');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', item.icon);
    });
  });

  it('applies active class to the active tab', () => {
    renderWithRouter(
      <TabBar
        items={mockItems}
        activeTab="positions"
        onTabChange={() => {}}
      />
    );

    const activeTab = screen.getByRole('tab', { name: 'Positions' });
    const inactiveTab = screen.getByRole('tab', { name: 'Trade' });

    expect(activeTab).toHaveClass('tabButton_123', 'active_123');
    expect(inactiveTab).toHaveClass('tabButton_123');
    expect(inactiveTab).not.toHaveClass('active_123');
  });

  it('calls onTabChange with correct tab id when clicked', () => {
    renderWithRouter(
      <TabBar
        items={mockItems}
        activeTab="trade"
        onTabChange={mockOnTabChange}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Positions' }));
    expect(mockOnTabChange).toHaveBeenCalledWith('positions');

    fireEvent.click(screen.getByRole('tab', { name: 'Cashier' }));
    expect(mockOnTabChange).toHaveBeenCalledWith('cashier');
  });

  it('distributes width evenly among tabs', () => {
    renderWithRouter(
      <TabBar
        items={mockItems}
        activeTab="trade"
        onTabChange={mockOnTabChange}
      />
    );

    const tabs = screen.getAllByRole('tab');
    const expectedWidth = `${100 / mockItems.length}%`;

    tabs.forEach(tab => {
      expect(tab).toHaveStyle({ width: expectedWidth });
    });
  });

  it('validates required props', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderWithRouter(<TabBar />)).toThrow();
    expect(() => renderWithRouter(<TabBar items={mockItems} />)).toThrow();
    expect(() => renderWithRouter(<TabBar items={mockItems} activeTab="trade" />)).toThrow();

    consoleError.mockRestore();
  });
});
