import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../../../test/test-utils';
import Dashboard from './Dashboard';
describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with welcome message', () => {
    renderWithRouter(<Dashboard />);

    expect(screen.getByText(/Welcome to Champion Trade/i)).toBeInTheDocument();
    expect(screen.getByText(/Your gateway to smarter trading/i)).toBeInTheDocument();
  });

  it('renders trading overview section', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Your Trading Overview')).toBeInTheDocument();
    expect(screen.getByText(/Start exploring your trading dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view analytics/i })).toBeInTheDocument();
  });

  it('renders quick actions section', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view markets/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /account settings/i })).toBeInTheDocument();
  });
});
