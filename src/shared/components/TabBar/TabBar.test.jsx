import { describe, it, expect, vi } from 'vitest';
import { renderWithContainer, screen, fireEvent } from '@/test/test-utils';
import TabBar from './TabBar';

describe('TabBar', () => {
  const mockItems = [
    { id: 'tab1', icon: '/icon1.svg', label: 'Tab 1' },
    { id: 'tab2', icon: '/icon2.svg', label: 'Tab 2' },
    { id: 'tab3', icon: '/icon3.svg', label: 'Tab 3' },
  ];

  const defaultProps = {
    items: mockItems,
    activeTab: 'tab1',
    onTabChange: vi.fn(),
  };

  it('renders all tabs with correct content', () => {
    renderWithContainer(<TabBar {...defaultProps} />);
    
    mockItems.forEach(item => {
      const tab = screen.getByRole('tab', { name: new RegExp(item.label) });
      expect(tab).toBeInTheDocument();
      expect(tab.querySelector('img')).toHaveAttribute('src', item.icon);
      expect(tab.querySelector('span')).toHaveTextContent(item.label);
    });
  });

  it('throws error when required props are missing', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderWithContainer(<TabBar />))
      .toThrow('TabBar: items prop is required');

    expect(() => renderWithContainer(<TabBar items={mockItems} />))
      .toThrow('TabBar: activeTab prop is required');

    expect(() => renderWithContainer(<TabBar items={mockItems} activeTab="tab1" />))
      .toThrow('TabBar: onTabChange prop is required');

    consoleError.mockRestore();
  });

  it('applies correct width to tab buttons', () => {
    renderWithContainer(<TabBar {...defaultProps} />);
    const buttons = screen.getAllByRole('tab');
    buttons.forEach(button => {
      expect(button).toHaveStyle({ width: `${100 / mockItems.length}%` });
    });
  });

  it('marks active tab correctly', () => {
    renderWithContainer(<TabBar {...defaultProps} activeTab="tab2" />);
    
    const activeTab = screen.getByRole('tab', { name: /Tab 2/i });
    const inactiveTabs = [
      screen.getByRole('tab', { name: /Tab 1/i }),
      screen.getByRole('tab', { name: /Tab 3/i }),
    ];

    expect(activeTab.className).toContain('active');
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    expect(activeTab).toHaveAttribute('tabIndex', '0');

    inactiveTabs.forEach(tab => {
      expect(tab).not.toHaveClass('active');
      expect(tab).toHaveAttribute('aria-selected', 'false');
      expect(tab).toHaveAttribute('tabIndex', '-1');
    });
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    renderWithContainer(<TabBar {...defaultProps} onTabChange={onTabChange} />);
    
    const secondTab = screen.getByRole('tab', { name: /Tab 2/i });
    fireEvent.click(secondTab);
    
    expect(onTabChange).toHaveBeenCalledWith('tab2');
  });

  describe('keyboard navigation', () => {
    it('handles Enter key press', () => {
      const onTabChange = vi.fn();
      renderWithContainer(<TabBar {...defaultProps} onTabChange={onTabChange} />);
      
      const secondTab = screen.getByRole('tab', { name: /Tab 2/i });
      fireEvent.keyDown(secondTab, { key: 'Enter' });
      
      expect(onTabChange).toHaveBeenCalledWith('tab2');
    });

    it('handles Space key press', () => {
      const onTabChange = vi.fn();
      renderWithContainer(<TabBar {...defaultProps} onTabChange={onTabChange} />);
      
      const secondTab = screen.getByRole('tab', { name: /Tab 2/i });
      fireEvent.keyDown(secondTab, { key: ' ' });
      
      expect(onTabChange).toHaveBeenCalledWith('tab2');
    });

    it('prevents default on Space key press', () => {
      renderWithContainer(<TabBar {...defaultProps} />);
      const secondTab = screen.getByRole('tab', { name: /Tab 2/i });
      
      // Create a synthetic event
      const event = new KeyboardEvent('keydown', { 
        key: ' ',
        bubbles: true,
        cancelable: true
      });
      
      // Spy on preventDefault
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      // Dispatch the event
      secondTab.dispatchEvent(event);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  it('sets correct ARIA attributes', () => {
    renderWithContainer(<TabBar {...defaultProps} />);
    
    const nav = screen.getByRole('tablist');
    expect(nav).toHaveAttribute('aria-label', 'Navigation tabs');

    mockItems.forEach(item => {
      const tab = screen.getByRole('tab', { name: new RegExp(item.label) });
      expect(tab).toHaveAttribute('aria-controls', `${item.id}-panel`);
    });
  });

  it('sets images as decorative', () => {
    renderWithContainer(<TabBar {...defaultProps} />);
    
    const images = screen.getAllByRole('img', { hidden: true });
    images.forEach(img => {
      expect(img).toHaveAttribute('alt', '');
      expect(img).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
