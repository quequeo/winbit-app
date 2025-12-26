import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';

vi.mock('../hooks/useAuth');
vi.mock('../hooks/useInvestorData');

describe('DashboardPage', () => {
  it('shows spinner when loading', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);
    expect(screen.queryByText(/Hola,/)).not.toBeInTheDocument();
  });

  it('shows error message and retry calls refetch', () => {
    const refetch = vi.fn();
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Oops',
      refetch,
    });

    render(<DashboardPage />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Try Again'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows fallback error when data is missing', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByText('No hay datos disponibles para tu cuenta')).toBeInTheDocument();
  });

  it('renders dashboard when data is available', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: {
        name: 'Juan',
        balance: 100,
        totalInvested: 90,
        returns: 10,
        historicalData: [],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      },
    });

    render(<DashboardPage />);
    expect(screen.getByText('Hola, Juan')).toBeInTheDocument();
    expect(screen.getByText('Performance History')).toBeInTheDocument();
  });
});
