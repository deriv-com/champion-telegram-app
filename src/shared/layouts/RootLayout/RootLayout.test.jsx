import { render, screen } from '@testing-library/react';
import RootLayout from './RootLayout';
import styles from './RootLayout.module.css';

describe('RootLayout', () => {
  it('renders header and main content', () => {
    const testContent = <div data-testid="test-content">Test Content</div>;
    render(<RootLayout>{testContent}</RootLayout>);
    
    // Check if header is rendered
    expect(screen.getByRole('banner')).toBeInTheDocument();
    
    // Check if main content is rendered
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('has correct structure', () => {
    render(<RootLayout>Test</RootLayout>);
    
    const rootElement = document.querySelector(`.${styles.root}`);
    expect(rootElement).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
