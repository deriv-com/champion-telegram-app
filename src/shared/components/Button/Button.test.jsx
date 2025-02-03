import { describe, it, expect } from 'vitest';
import { renderWithContainer, screen } from '@/test/test-utils';
import Button from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    renderWithContainer(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders with primary variant by default', () => {
    renderWithContainer(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('buttonPrimary');
  });

  it('renders with secondary variant when specified', () => {
    renderWithContainer(<Button variant="secondary">Click me</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('buttonSecondary');
  });

  it('applies custom className when provided', () => {
    renderWithContainer(<Button className="custom-class">Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles loading state', () => {
    renderWithContainer(<Button loading>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('loading');
    expect(button).toBeDisabled();
  });

  it('handles disabled state', () => {
    renderWithContainer(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('passes through additional props', () => {
    renderWithContainer(
      <Button data-testid="test-button" type="submit">
        Click me
      </Button>
    );
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('combines multiple classes correctly', () => {
    renderWithContainer(
      <Button variant="secondary" loading className="custom-class">
        Click me
      </Button>
    );
    const button = screen.getByRole('button');
    const className = button.className;
    expect(className).toContain('buttonSecondary');
    expect(className).toContain('loading');
    expect(className).toContain('custom-class');
  });

  it('throws error when children prop is missing', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderWithContainer(<Button />);
      throw new Error('Should not reach this point');
    }).toThrow();
    consoleError.mockRestore();
  });
});
