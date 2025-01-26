import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';
import styles from './Button.module.css';

// Mock CSS modules
vi.mock('./Button.module.css', () => ({
  default: {
    button: '_button_6cda4c',
    buttonPrimary: '_buttonPrimary_6cda4c',
    buttonSecondary: '_buttonSecondary_6cda4c',
    loading: '_loading_6cda4c',
  },
}));

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary Button</Button>);
    const button = screen.getByText('Primary Button');
    expect(button).toHaveClass('_buttonPrimary_6cda4c');
  });

  it('applies secondary variant styles when specified', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByText('Secondary Button');
    expect(button).toHaveClass('_buttonSecondary_6cda4c');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
  });

  it('renders loading state correctly', () => {
    render(<Button loading disabled>Loading Button</Button>);
    const button = screen.getByText('Loading Button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('_loading_6cda4c');
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-class';
    render(<Button className={customClass}>Custom Button</Button>);
    const button = screen.getByText('Custom Button');
    expect(button).toHaveClass(customClass, '_buttonPrimary_6cda4c');
  });

  it('spreads additional props to button element', () => {
    render(<Button data-testid="test-button" type="submit">Submit</Button>);
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('maintains accessibility attributes', () => {
    render(<Button aria-label="accessible button">Click me</Button>);
    const button = screen.getByLabelText('accessible button');
    expect(button).toBeInTheDocument();
  });
});
