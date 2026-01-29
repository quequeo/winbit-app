import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';
import * as useAuthModule from '../hooks/useAuth';
import * as useInvestorDataModule from '../hooks/useInvestorData';
import * as useInvestorHistoryModule from '../hooks/useInvestorHistory';

const useAuth = vi.spyOn(useAuthModule, 'useAuth');
const useInvestorData = vi.spyOn(useInvestorDataModule, 'useInvestorData');
const useInvestorHistory = vi.spyOn(useInvestorHistoryModule, 'useInvestorHistory');

describe('DashboardPage', () => {
  it('shows spinner when loading', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    useInvestorHistory.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });

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
    useInvestorHistory.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });

    render(<DashboardPage />);
    expect(screen.getByText('Ocurrió un error')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reintentar'));
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
    useInvestorHistory.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });

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
        totalInvested: 80,
        strategyReturnYtdUsd: 20,
        strategyReturnYtdPct: 25,
        strategyReturnAllUsd: 20,
        strategyReturnAllPct: 25,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      },
    });
    useInvestorHistory.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });

    render(<DashboardPage />);
    expect(screen.getByText('Hola, Juan')).toBeInTheDocument();
    expect(screen.getByText('Valor actual del portafolio (USD)')).toBeInTheDocument();
    expect(screen.getByText('Total invertido (USD)')).toBeInTheDocument();
    expect(screen.getByText('$100,00')).toBeInTheDocument();
    // Range buttons are grouped under the chart aria-label.
    expect(screen.getByRole('group', { name: 'Evolución del portafolio' })).toBeInTheDocument();
    expect(screen.getByText('7 días')).toBeInTheDocument();
    expect(screen.getByText('1 mes')).toBeInTheDocument();
    expect(screen.getByText('3 meses')).toBeInTheDocument();
    expect(screen.getByText('6 meses')).toBeInTheDocument();
    expect(screen.getByText('1 año')).toBeInTheDocument();
    expect(screen.getByText('Todo')).toBeInTheDocument();
  });
});
