import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { ToastProvider } from '../components/ui/ToastProvider';
import * as useAuthModule from '../hooks/useAuth';
import * as useInvestorDataModule from '../hooks/useInvestorData';
import * as useInvestorHistoryModule from '../hooks/useInvestorHistory';
import * as useStrategyOperationsModule from '../hooks/useStrategyOperations';
import * as apiModule from '../services/api';

const useAuth = vi.spyOn(useAuthModule, 'useAuth');
const useInvestorData = vi.spyOn(useInvestorDataModule, 'useInvestorData');
const useInvestorHistory = vi.spyOn(useInvestorHistoryModule, 'useInvestorHistory');
const useStrategyOperations = vi.spyOn(useStrategyOperationsModule, 'useStrategyOperations');
const downloadInvestorMonthlyReport = vi.spyOn(apiModule, 'downloadInvestorMonthlyReport');

const defaultStrategyOps = {
  data: [],
  strategyByDate: {},
  loading: false,
  error: null,
};

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <DashboardPage />
      </ToastProvider>
    </MemoryRouter>,
  );

const mockData = {
  name: 'Juan',
  balance: 14714.57,
  totalInvested: 15000,
  strategyReturnYtdUsd: -285.43,
  strategyReturnYtdPct: -1.9,
  strategyReturnAllUsd: -285.43,
  strategyReturnAllPct: -1.9,
  lastUpdated: '2026-06-10T18:00:00.000Z',
};

describe('DashboardPage', () => {
  beforeEach(() => {
    useStrategyOperations.mockReturnValue(defaultStrategyOps);
    downloadInvestorMonthlyReport.mockResolvedValue({
      data: { blob: new Blob(['%PDF'], { type: 'application/pdf' }), filename: 'reporte.pdf' },
      error: null,
    });
    useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      userEmail: 'test@example.com',
    });
  });

  it('shows skeleton when loading persists beyond delay', () => {
    vi.useFakeTimers();
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    useInvestorHistory.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });

    renderDashboard();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
    vi.useRealTimers();
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

    renderDashboard();
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

    renderDashboard();
    expect(screen.getByText('No hay datos disponibles para tu cuenta')).toBeInTheDocument();
  });

  it('renders dashboard layout when data is available', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: mockData,
    });
    useInvestorHistory.mockReturnValue({
      data: [
        {
          id: 'op1',
          date: '2026-06-17T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: 50.06,
          status: 'COMPLETED',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    useStrategyOperations.mockReturnValue({
      data: [{ operationDate: '2026-06-17', asset: 'MES', direction: 'LONG' }],
      strategyByDate: {
        '2026-06-17': { operationDate: '2026-06-17', asset: 'MES', direction: 'LONG' },
      },
      loading: false,
      error: null,
    });

    renderDashboard();
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Resumen de tu inversión')).toBeInTheDocument();
    expect(screen.getByText('Valor actual del portafolio')).toBeInTheDocument();
    expect(screen.getByText('Rendimiento acumulado')).toBeInTheDocument();
    expect(screen.getByText('Desde el inicio')).toBeInTheDocument();
    expect(screen.getByText('Acumulado anual')).toBeInTheDocument();
    expect(screen.getByText('USD 14.714,57')).toBeInTheDocument();
    expect(screen.queryByText('Contactar soporte')).not.toBeInTheDocument();
    expect(screen.getByText('Acciones rápidas')).toBeInTheDocument();
    expect(screen.getByText('Operativa reciente')).toBeInTheDocument();
    expect(screen.getAllByLabelText('S&P 500').length).toBeGreaterThan(0);
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('3M')).toBeInTheDocument();
    expect(screen.getByText('Máx')).toBeInTheDocument();
  });

  it('shows chart when history has at least 2 balance points', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: mockData,
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

    renderDashboard();
    expect(screen.getByRole('img', { name: 'Evolución del capital' })).toBeInTheDocument();
  });

  it('shows chart loading when history is loading', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: mockData,
    });
    useInvestorHistory.mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByText('Cargando evolución…')).toBeInTheDocument();
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

    renderDashboard();
    expect(screen.getByText('Acceso no autorizado')).toBeInTheDocument();
  });

  it('toggles balance visibility', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: mockData,
    });
    useInvestorHistory.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });

    renderDashboard();
    expect(screen.getByText('USD 14.714,57')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Ocultar saldos'));
    expect(screen.queryByText('USD 14.714,57')).not.toBeInTheDocument();
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

    renderDashboard();
    expect(screen.getByText('Google Sheets no está configurado.')).toBeInTheDocument();
  });

  it('downloads monthly report when download button is clicked', async () => {
    useInvestorData.mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
      data: mockData,
    });
    useInvestorHistory.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });

    renderDashboard();
    fireEvent.click(screen.getByLabelText('Descargar reporte'));

    await waitFor(() => {
      expect(downloadInvestorMonthlyReport).toHaveBeenCalledWith('test@example.com');
    });
    expect(await screen.findByText('La descarga del reporte comenzó.')).toBeInTheDocument();
  });
});
