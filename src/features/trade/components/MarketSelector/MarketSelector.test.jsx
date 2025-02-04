import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MarketSelector from './MarketSelector';

describe('MarketSelector', () => {
  const mockActiveSymbols = [
    { symbol: 'R_100', displayName: 'Volatility 100 Index' },
    { symbol: 'R_75', displayName: 'Volatility 75 Index' },
    { symbol: 'R_50', displayName: 'Volatility 50 Index' }
  ];

  it('renders without crashing', () => {
    render(<MarketSelector activeSymbols={mockActiveSymbols} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays all provided markets', () => {
    render(<MarketSelector activeSymbols={mockActiveSymbols} />);
    mockActiveSymbols.forEach(market => {
      expect(screen.getByText(market.displayName)).toBeInTheDocument();
    });
  });

  it('selects first market by default', () => {
    render(<MarketSelector activeSymbols={mockActiveSymbols} />);
    const select = screen.getByRole('combobox');
    expect(select.value).toBe(mockActiveSymbols[0].symbol);
  });

  it('uses defaultMarket when provided', () => {
    const defaultMarket = 'R_75';
    render(
      <MarketSelector
        activeSymbols={mockActiveSymbols}
        defaultMarket={defaultMarket}
      />
    );
    const select = screen.getByRole('combobox');
    expect(select.value).toBe(defaultMarket);
  });

  it('calls onMarketChange when selection changes', () => {
    const handleChange = vi.fn();
    render(
      <MarketSelector
        activeSymbols={mockActiveSymbols}
        onMarketChange={handleChange}
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'R_75' } });
    
    expect(handleChange).toHaveBeenCalledWith('R_75');
  });

  it('shows error message when no markets are available', () => {
    render(<MarketSelector activeSymbols={[]} />);
    expect(screen.getByText('No markets available')).toBeInTheDocument();
  });
});
