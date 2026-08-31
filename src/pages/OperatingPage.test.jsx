import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OperatingPage } from './OperatingPage';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'test@example.com' }, userEmail: 'test@example.com' }),
}));

const mockUseInvestorHistory = vi.fn();
vi.mock('../hooks/useInvestorHistory', () => ({
  useInvestorHistory: (...args) => mockUseInvestorHistory(...args),
}));

vi.mock('../hooks/useStrategyOperations', () => ({
  useStrategyOperations: () => ({
    data: [
      {
        operationDate: '2026-05-15',
        asset: 'BTC',
        direction: 'LONG',
        openedAt: '11:19',
        closedAt: '11:26',
        ratio: 1.1,
      },
    ],
    strategyByDate: {
      '2026-05-15': {
        operationDate: '2026-05-15',
        asset: 'BTC',
        direction: 'LONG',
        openedAt: '11:19',
        closedAt: '11:26',
        ratio: 1.1,
      },
    },
    loading: false,
    error: null,
  }),
}));

const renderOperatingPage = (options = {}) =>
  render(
    <MemoryRouter initialEntries={options.initialEntries ?? ['/operational']}>
      <OperatingPage />
    </MemoryRouter>,
  );

const OPERATING_TEST_NOW = new Date('2026-06-15T18:00:00.000Z');

describe('OperatingPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(OPERATING_TEST_NOW);
    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows skeleton when loading', () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    const { container } = renderOperatingPage();
    expect(container.querySelector('.wb-skeleton')).toBeInTheDocument();
  });

  it('shows error message and retry when error', () => {
    const refetch = vi.fn();
    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: false,
      error: 'Google Sheets credentials not configured',
      refetch,
    });
    renderOperatingPage();
    expect(screen.getByText('Google Sheets no está configurado.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reintentar'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows email mapping error when configured', () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: false,
      error: 'Investor email mapping not configured',
      refetch: vi.fn(),
    });
    renderOperatingPage();
    expect(screen.getByText(/Falta configurar el mapeo/i)).toBeInTheDocument();
  });

  it('shows empty state when no operating results', () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderOperatingPage();
    expect(screen.getByText('Historial operativo')).toBeInTheDocument();
    expect(screen.getByText('Sin operativas todavía')).toBeInTheDocument();
  });

  it('renders only operating_result rows as trade cards', () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [
        {
          code: '001',
          date: '2026-05-15T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: 10,
          previousBalance: 100,
          newBalance: 110,
          status: 'COMPLETED',
          asset: 'MBT',
          contract: 'MBT',
          direction: 'LONG',
        },
        {
          code: '001',
          date: '2025-12-03T00:00:00.000Z',
          movement: 'DEPOSIT',
          amount: 1000,
          previousBalance: 110,
          newBalance: 1110,
          status: 'COMPLETED',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderOperatingPage();

    expect(screen.getByText('Historial operativo')).toBeInTheDocument();
    expect(screen.getAllByText('+USD 10,00').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Micro Bitcoin|MBT/).length).toBeGreaterThan(0);
    expect(screen.getByText('Cantidad de operaciones')).toBeInTheDocument();
    expect(screen.queryByText('Cerrada')).not.toBeInTheDocument();
    expect(screen.queryByText('Depósito')).not.toBeInTheDocument();
  });

  it('shows all rows in selected period without pagination', () => {
    const rows = Array.from({ length: 25 }, (_, i) => ({
      code: '001',
      date: `2026-05-${String((i % 28) + 1).padStart(2, '0')}T17:00:00.000Z`,
      movement: 'OPERATING_RESULT',
      amount: i % 2 === 0 ? 10 : -5,
      previousBalance: 100,
      newBalance: i % 2 === 0 ? 110 : 95,
      status: 'COMPLETED',
      asset: 'MBT',
      contract: 'MBT',
      direction: i % 2 === 0 ? 'LONG' : 'SHORT',
    }));
    mockUseInvestorHistory.mockReturnValue({
      data: rows,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderOperatingPage();
    expect(screen.getAllByRole('button', { name: /Ver detalle/i })).toHaveLength(25);
    expect(screen.queryByText(/Página 1 de/)).not.toBeInTheDocument();
  });

  it('shows negative amount in red', () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [
        {
          code: '001',
          date: '2026-05-01T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: -15,
          previousBalance: 100,
          newBalance: 85,
          status: 'COMPLETED',
          asset: 'MBT',
          contract: 'MBT',
          direction: 'SHORT',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderOperatingPage();
    expect(screen.getAllByText('-USD 15,00').length).toBeGreaterThan(0);
    expect(screen.getByText(/Short/)).toBeInTheDocument();
  });

  it('shows calendar range filter labels', () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [
        {
          code: '001',
          date: '2026-05-15T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: 10,
          previousBalance: 100,
          newBalance: 110,
          status: 'COMPLETED',
          asset: 'MBT',
          contract: 'MBT',
          direction: 'LONG',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderOperatingPage();
    expect(screen.getByRole('button', { name: 'Semana actual' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Este mes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Este trimestre' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '7D' })).not.toBeInTheDocument();
  });

  it('filters quarter range by calendar months not rolling ninety days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-09T15:00:00.000Z'));

    mockUseInvestorHistory.mockReturnValue({
      data: [
        {
          code: '001',
          date: '2026-04-15T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: 10,
          previousBalance: 100,
          newBalance: 110,
          status: 'COMPLETED',
          asset: 'MBT',
          contract: 'MBT',
          direction: 'LONG',
        },
        {
          code: '001',
          date: '2026-05-15T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: 12,
          previousBalance: 110,
          newBalance: 122,
          status: 'COMPLETED',
          asset: 'MBT',
          contract: 'MBT',
          direction: 'LONG',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderOperatingPage();

    expect(screen.getAllByRole('button', { name: /Ver detalle/i })).toHaveLength(1);

    vi.useRealTimers();
  });

  it('opens detail view when Ver detalle is clicked', async () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [
        {
          code: '001',
          date: '2026-05-15T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: -35.18,
          previousBalance: 2882.5,
          newBalance: 2847.32,
          status: 'COMPLETED',
          asset: 'MBT',
          contract: 'MBT',
          direction: 'LONG',
          openedAt: '10:39',
          closedAt: '11:09',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderOperatingPage();
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Ver detalle/i }));
    });
    expect(screen.getAllByText('Detalle de operación').length).toBeGreaterThan(0);
    expect(screen.getByText('Apertura')).toBeInTheDocument();
    expect(screen.getByText('Cierre')).toBeInTheDocument();
    // Merged strategy times for 2026-05-15 are 11:19 → 11:26
    expect(screen.getByText('7 min')).toBeInTheDocument();
    expect(screen.getByText('Precio de entrada')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    const resultPctNodes = screen.getAllByText('-1,22%');
    expect(resultPctNodes.length).toBeGreaterThanOrEqual(2);
    resultPctNodes.forEach((node) => {
      expect(node).toHaveClass('text-error');
    });
    expect(screen.queryByText('1 día')).not.toBeInTheDocument();
    expect(screen.queryByText('Resumen por activo')).not.toBeInTheDocument();
    expect(screen.queryByText('Comentario')).not.toBeInTheDocument();
  });
});
