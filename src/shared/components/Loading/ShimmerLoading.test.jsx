import { describe, it, expect } from 'vitest';
import { renderWithContainer, screen } from '@/test/test-utils';
import { ShimmerLoading } from './ShimmerLoading';

describe('ShimmerLoading', () => {
  it('renders single line shimmer by default', () => {
    renderWithContainer(<ShimmerLoading />);
    const container = screen.getByTestId('shimmer-container');
    expect(container.className).toContain('shimmerContainer');
    expect(container.className).toContain('rounded');
    expect(container.querySelector('[class*="shimmer"]')).toBeInTheDocument();
  });

  it('renders multiple lines with custom dimensions', () => {
    const lines = [
      { width: '100px', height: '20px' },
      { width: '200px', height: '30px' }
    ];
    
    renderWithContainer(<ShimmerLoading lines={lines} />);
    const shimmerLines = screen.getAllByTestId('shimmer-line');
    
    expect(shimmerLines).toHaveLength(2);
    expect(shimmerLines[0]).toHaveStyle({ width: '100px', height: '20px' });
    expect(shimmerLines[1]).toHaveStyle({ width: '200px', height: '30px' });
  });

  it('applies custom gap between lines', () => {
    const lines = [
      { width: '100px' },
      { width: '200px' }
    ];
    
    renderWithContainer(<ShimmerLoading lines={lines} gap={16} />);
    const wrapper = screen.getByTestId('shimmer-complex-container');
    expect(wrapper).toHaveStyle({ gap: '16px' });
  });

  it('applies different shapes', () => {
    const shapes = ['rounded', 'circular', 'square'];
    
    shapes.forEach(shape => {
      const { container } = renderWithContainer(<ShimmerLoading shape={shape} />);
      const shimmer = container.querySelector(`[class*="${shape}"]`);
      expect(shimmer).toBeInTheDocument();
    });
  });

  it('applies custom container styles', () => {
    const containerStyle = {
      padding: '20px',
      backgroundColor: 'rgb(255, 0, 0)'
    };
    
    renderWithContainer(<ShimmerLoading containerStyle={containerStyle} />);
    const container = screen.getByTestId('shimmer-container');
    expect(container).toHaveStyle('padding: 20px');
    expect(container).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('applies custom className', () => {
    const customClass = 'custom-shimmer';
    renderWithContainer(<ShimmerLoading className={customClass} />);
    const container = screen.getByTestId('shimmer-container');
    expect(container.className).toContain(customClass);
  });

  it('applies custom line styles', () => {
    const lines = [{
      width: '100px',
      height: '20px',
      style: {
        borderRadius: '8px',
        marginBottom: '10px'
      }
    }];
    
    renderWithContainer(<ShimmerLoading lines={lines} />);
    const line = screen.getByTestId('shimmer-line');
    expect(line).toHaveStyle({
      borderRadius: '8px',
      marginBottom: '10px'
    });
  });

  it('uses default height when not specified', () => {
    const lines = [{ width: '100px' }];
    renderWithContainer(<ShimmerLoading lines={lines} />);
    const line = screen.getByTestId('shimmer-line');
    expect(line).toHaveStyle({ height: '20px' });
  });

  it('uses full width when not specified', () => {
    const lines = [{ height: '20px' }];
    renderWithContainer(<ShimmerLoading lines={lines} />);
    const line = screen.getByTestId('shimmer-line');
    expect(line).toHaveStyle({ width: '100%' });
  });
});
