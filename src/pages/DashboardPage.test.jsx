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
    expect(screen.queryByText('Juan')).not.toBeInTheDocument();
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
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Valor del portafolio (USD)')).toBeInTheDocument();
    expect(screen.getByText('Capital invertido (USD)')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    // Range buttons are grouped under the chart aria-label.
    expect(screen.getByRole('group', { name: 'Evolución del portafolio' })).toBeInTheDocument();
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('1M')).toBeInTheDocument();
    expect(screen.getByText('3M')).toBeInTheDocument();
    expect(screen.getByText('6M')).toBeInTheDocument();
    expect(screen.getByText('1A')).toBeInTheDocument();
    expect(screen.getByText('Máx')).toBeInTheDocument();
  });

  it('shows chart and responds to mouse hover', () => {
    const mockGetBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 900,
      height: 240,
      right: 900,
      bottom: 240,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: {
        name: 'Juan',
        balance: 1000,
        totalInvested: 800,
        strategyReturnYtdUsd: 200,
        strategyReturnYtdPct: 25,
        strategyReturnAllUsd: 200,
        strategyReturnAllPct: 25,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      },
    });
    useInvestorHistory.mockReturnValue({
      data: [
        { date: '2024-01-01T12:00:00.000Z', newBalance: 800, status: 'COMPLETED' },
        { date: '2024-01-15T12:00:00.000Z', newBalance: 900, status: 'COMPLETED' },
        { date: '2024-01-31T12:00:00.000Z', newBalance: 1000, status: 'COMPLETED' },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);
    const chart = screen.getByRole('img', { name: 'Evolución del portafolio' });
    chart.getBoundingClientRect = mockGetBoundingClientRect;
    fireEvent.mouseMove(chart, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(chart, { clientX: 5, clientY: 50 });
    fireEvent.mouseLeave(chart);
  });

  it('shows chart when history has at least 2 balance points', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: {
        name: 'Juan',
        balance: 1000,
        totalInvested: 800,
        strategyReturnYtdUsd: 200,
        strategyReturnYtdPct: 25,
        strategyReturnAllUsd: 200,
        strategyReturnAllPct: 25,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      },
    });
    useInvestorHistory.mockReturnValue({
      data: [
        { date: '2024-01-01T12:00:00.000Z', newBalance: 800, status: 'COMPLETED' },
        { date: '2024-01-15T12:00:00.000Z', newBalance: 900, status: 'COMPLETED' },
        { date: '2024-01-31T12:00:00.000Z', newBalance: 1000, status: 'COMPLETED' },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByRole('img', { name: 'Evolución del portafolio' })).toBeInTheDocument();
  });

  it('formats large chart values with k/m suffix', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: {
        name: 'Juan',
        balance: 1500000,
        totalInvested: 1000000,
        strategyReturnYtdUsd: 200,
        strategyReturnYtdPct: 25,
        strategyReturnAllUsd: 200,
        strategyReturnAllPct: 25,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      },
    });
    useInvestorHistory.mockReturnValue({
      data: [
        { date: '2024-01-01T12:00:00.000Z', newBalance: 1000000, status: 'COMPLETED' },
        { date: '2024-01-31T12:00:00.000Z', newBalance: 1500000, status: 'COMPLETED' },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByRole('img', { name: 'Evolución del portafolio' })).toBeInTheDocument();
  });

  it('shows no data message when history has fewer than 2 points', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: {
        name: 'Juan',
        balance: 1000,
        totalInvested: 800,
        strategyReturnYtdUsd: 200,
        strategyReturnYtdPct: 25,
        strategyReturnAllUsd: 200,
        strategyReturnAllPct: 25,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      },
    });
    useInvestorHistory.mockReturnValue({
      data: [{ date: '2024-01-01T12:00:00.000Z', newBalance: 1000, status: 'COMPLETED' }],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByText('Aún no hay datos históricos disponibles.')).toBeInTheDocument();
  });

  it('shows UnauthorizedPage when unauthorized', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      unauthorized: true,
      refetch: vi.fn(),
    });
    useInvestorHistory.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });

    render(<DashboardPage />);
    expect(screen.getByText('Acceso no autorizado')).toBeInTheDocument();
  });

  it('filters chart by 7 days range', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: {
        name: 'Juan',
        balance: 1000,
        totalInvested: 800,
        strategyReturnYtdUsd: 200,
        strategyReturnYtdPct: 25,
        strategyReturnAllUsd: 200,
        strategyReturnAllPct: 25,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      },
    });
    useInvestorHistory.mockReturnValue({
      data: [
        { date: '2024-01-01T12:00:00.000Z', newBalance: 800, status: 'COMPLETED' },
        { date: '2024-01-05T12:00:00.000Z', newBalance: 900, status: 'COMPLETED' },
        { date: '2024-01-08T12:00:00.000Z', newBalance: 1000, status: 'COMPLETED' },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);
    fireEvent.click(screen.getByText('7D'));
    expect(screen.getByText('7D')).toBeInTheDocument();
  });

  it('filters chart by 6 months and 1 year ranges', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: {
        name: 'Juan',
        balance: 1000,
        totalInvested: 800,
        strategyReturnYtdUsd: 200,
        strategyReturnYtdPct: 25,
        strategyReturnAllUsd: 200,
        strategyReturnAllPct: 25,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      },
    });
    useInvestorHistory.mockReturnValue({
      data: [
        { date: '2024-01-01T12:00:00.000Z', newBalance: 800, status: 'COMPLETED' },
        { date: '2024-06-15T12:00:00.000Z', newBalance: 900, status: 'COMPLETED' },
        { date: '2024-12-31T12:00:00.000Z', newBalance: 1000, status: 'COMPLETED' },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);
    fireEvent.click(screen.getByText('6M'));
    expect(screen.getByText('6M')).toBeInTheDocument();
    fireEvent.click(screen.getByText('1A'));
    expect(screen.getByText('1A')).toBeInTheDocument();
  });

  it('shows Todo range and chart when ALL selected', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: {
        name: 'Juan',
        balance: 1000,
        totalInvested: 800,
        strategyReturnYtdUsd: 200,
        strategyReturnYtdPct: 25,
        strategyReturnAllUsd: 200,
        strategyReturnAllPct: 25,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      },
    });
    useInvestorHistory.mockReturnValue({
      data: [
        { date: '2024-01-01T12:00:00.000Z', newBalance: 800, status: 'COMPLETED' },
        { date: '2024-06-15T12:00:00.000Z', newBalance: 900, status: 'COMPLETED' },
        { date: '2024-12-31T12:00:00.000Z', newBalance: 1000, status: 'COMPLETED' },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);
    fireEvent.click(screen.getByText('Máx'));
    expect(screen.getByText('Máx')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Evolución del portafolio' })).toBeInTheDocument();
  });

  it('changes chart range when range button is clicked', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: {
        name: 'Juan',
        balance: 1000,
        totalInvested: 800,
        strategyReturnYtdUsd: 200,
        strategyReturnYtdPct: 25,
        strategyReturnAllUsd: 200,
        strategyReturnAllPct: 25,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      },
    });
    useInvestorHistory.mockReturnValue({
      data: [
        { date: '2024-01-01T12:00:00.000Z', newBalance: 800, status: 'COMPLETED' },
        { date: '2024-01-15T12:00:00.000Z', newBalance: 900, status: 'COMPLETED' },
        { date: '2024-01-31T12:00:00.000Z', newBalance: 1000, status: 'COMPLETED' },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);
    fireEvent.click(screen.getByText('1M'));
    expect(screen.getByText('1M')).toBeInTheDocument();
    fireEvent.click(screen.getByText('3M'));
    expect(screen.getByText('3M')).toBeInTheDocument();
  });

  it('shows chart loading when history is loading', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: {
        name: 'Juan',
        balance: 1000,
        totalInvested: 800,
        strategyReturnYtdUsd: 200,
        strategyReturnYtdPct: 25,
        strategyReturnAllUsd: 200,
        strategyReturnAllPct: 25,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      },
    });
    useInvestorHistory.mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByText('Cargando evolución…')).toBeInTheDocument();
  });

  it('shows Sheets credentials error when error matches', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Google Sheets credentials not configured',
      refetch: vi.fn(),
    });
    useInvestorHistory.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });

    render(<DashboardPage />);
    expect(screen.getByText('Google Sheets no está configurado.')).toBeInTheDocument();
  });
});
