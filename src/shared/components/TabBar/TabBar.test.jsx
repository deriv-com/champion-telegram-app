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

    // Check if all icons are rendered with correct alt text
    mockItems.forEach(item => {
      expect(screen.getByAltText(item.label)).toBeInTheDocument();
      expect(screen.getByAltText(item.label)).toHaveAttribute('src', item.icon);
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

    const activeButton = screen.getByText('Positions').closest('button');
    const inactiveButton = screen.getByText('Trade').closest('button');

    expect(activeButton).toHaveClass('tabButton_123', 'active_123');
    expect(inactiveButton).toHaveClass('tabButton_123');
    expect(inactiveButton).not.toHaveClass('active_123');
  });

  it('calls onTabChange with correct tab id when clicked', () => {
    renderWithRouter(
      <TabBar
        items={mockItems}
        activeTab="trade"
        onTabChange={mockOnTabChange}
      />
    );

    fireEvent.click(screen.getByText('Positions'));
    expect(mockOnTabChange).toHaveBeenCalledWith('positions');

    fireEvent.click(screen.getByText('Cashier'));
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

    const buttons = screen.getAllByRole('button');
    const expectedWidth = `${100 / mockItems.length}%`;

    buttons.forEach(button => {
      expect(button).toHaveStyle({ width: expectedWidth });
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
