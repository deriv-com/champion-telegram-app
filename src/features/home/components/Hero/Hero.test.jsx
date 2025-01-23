import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import styles from './Hero.module.css';

describe('Hero', () => {
  it('renders hero section with content', () => {
    render(<Hero />);
    
    // Check if logo is rendered
    expect(screen.getByAltText('Champion Trade')).toBeInTheDocument();
    
    // Check if title and subtitle are rendered
    expect(screen.getByText('Trade Smarter with Champion Trade')).toBeInTheDocument();
    expect(screen.getByText('Experience the future of trading with our advanced platform, powerful tools, and expert insights')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<Hero />);
    
    const loginButton = screen.getByText('Login');
    const openAccountButton = screen.getByText('Open Account');
    
    expect(loginButton).toHaveClass(styles.buttonSecondary);
    expect(openAccountButton).toHaveClass(styles.buttonPrimary);
  });

  it('has correct section structure', () => {
    render(<Hero />);
    
    expect(screen.getByRole('banner')).toHaveClass(styles.hero);
    expect(screen.getByRole('banner').querySelector(`.${styles.container}`)).toBeInTheDocument();
    expect(screen.getByRole('banner').querySelector(`.${styles.content}`)).toBeInTheDocument();
    expect(screen.getByRole('banner').querySelector(`.${styles.buttons}`)).toBeInTheDocument();
  });
});
