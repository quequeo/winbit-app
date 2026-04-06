import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HistoryPage } from './HistoryPage';
import { within } from '@testing-library/react';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'test@example.com' } }),
}));

vi.mock('../hooks/useInvestorHistory', () => ({
  useInvestorHistory: vi.fn(),
}));

import * as useInvestorHistoryModule from '../hooks/useInvestorHistory';

describe('HistoryPage', () => {
  beforeEach(() => {
    // Default mock implementation
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: [
        {
          code: '008',
          date: '2024-04-15T00:00:00.000Z',
          movement: 'Depósito',
          amount: 10000,
          previousBalance: 25000,
          newBalance: 35000,
          status: 'Completado',
        },
        {
          code: '008',
          date: '2024-03-15T00:00:00.000Z',
          movement: 'Retiro',
          amount: 5000,
          previousBalance: 30000,
          newBalance: 25000,
          status: 'Pendiente',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('renders mobile cards with history rows', () => {
    render(<HistoryPage />);
    expect(screen.getByText('Historial')).toBeInTheDocument();

    const mobile = screen.getByTestId('history-mobile');
    expect(within(mobile).getByText('Depósito')).toBeInTheDocument();
    expect(within(mobile).getByText('$10,000.00')).toBeInTheDocument();
    expect(within(mobile).getByText('Acreditado')).toBeInTheDocument();
    expect(within(mobile).getByTestId('icon-deposit-completed')).toBeInTheDocument();

    // Sorted by most recent first
    const cards = within(mobile).getAllByText(/Depósito|Retiro/);
    expect(cards[0].textContent).toBe('Depósito');
    expect(within(mobile).queryByTestId('icon-withdrawal-completed')).not.toBeInTheDocument();
  });

  it('handles events in English format (DEPOSIT, WITHDRAWAL, PROFIT)', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: [
        {
          code: '001',
          date: '2024-01-01T00:00:00.000Z',
          movement: 'DEPOSIT',
          amount: 1000,
          previousBalance: 0,
          newBalance: 1000,
          status: 'COMPLETED',
        },
        {
          code: '001',
          date: '2024-01-02T00:00:00.000Z',
          movement: 'WITHDRAWAL',
          amount: 200,
          previousBalance: 1000,
          newBalance: 800,
          status: 'COMPLETED',
        },
        {
          code: '001',
          date: '2024-01-03T00:00:00.000Z',
          movement: 'PROFIT',
          amount: 50,
          previousBalance: 800,
          newBalance: 850,
          status: 'COMPLETED',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<HistoryPage />);

    // All events should be translated to Spanish
    expect(screen.getAllByText('Depósito').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Retiro').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rendimiento/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ene\/2024/i).length).toBeGreaterThan(0);
  });

  it('translates referral commission events (REFERRAL_COMMISSION / REFERRAL_COMISSION)', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: [
        {
          code: '001',
          date: '2026-01-30T07:59:00.000Z',
          movement: 'REFERRAL_COMMISSION',
          amount: 20,
          previousBalance: 11190.85,
          newBalance: 11210.85,
          status: 'COMPLETED',
        },
        {
          code: '001',
          date: '2026-01-28T14:00:00.000Z',
          movement: 'REFERRAL_COMISSION', // typo (one "m")
          amount: 10,
          previousBalance: 11180.85,
          newBalance: 11190.85,
          status: 'COMPLETED',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<HistoryPage />);

    const mobile = screen.getByTestId('history-mobile');
    expect(within(mobile).getAllByText('Comisión por referido').length).toBe(2);
  });

  it('translates referral commission variants (spaces/hyphens)', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: [
        {
          code: '001',
          date: '2026-01-30T07:59:00.000Z',
          movement: 'Referral commission',
          amount: 20,
          previousBalance: 0,
          newBalance: 20,
          status: 'COMPLETED',
        },
        {
          code: '001',
          date: '2026-01-29T07:59:00.000Z',
          movement: 'referral-commission',
          amount: 5,
          previousBalance: 20,
          newBalance: 25,
          status: 'COMPLETED',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<HistoryPage />);
    const mobile = screen.getByTestId('history-mobile');
    expect(within(mobile).getAllByText('Comisión por referido').length).toBe(2);
  });

  it('displays dash for null balances (pending requests)', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: [
        {
          code: '001',
          date: '2024-01-01T00:00:00.000Z',
          movement: 'DEPOSIT',
          amount: 1000,
          previousBalance: null,
          newBalance: null,
          status: 'PENDING',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<HistoryPage />);

    const mobile = screen.getByTestId('history-mobile');
    // Should show "-" instead of "$0.00" for null balances
    const dashes = within(mobile).getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(2); // At least 2 for prev and new balance
  });

  it('hides operating results from history table', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: [
        {
          code: '001',
          date: '2025-12-01T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: -50,
          previousBalance: 1000,
          newBalance: 950,
          status: 'COMPLETED',
        },
        {
          code: '001',
          date: '2025-12-15T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: 20,
          previousBalance: 950,
          newBalance: 970,
          status: 'COMPLETED',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<HistoryPage />);

    expect(screen.queryByText(/Resultado Operativo/i)).not.toBeInTheDocument();
  });

  it('hides current-month operating results from history table', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-23T12:00:00.000Z'));

    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: [
        {
          code: '001',
          date: '2026-01-02T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: 7.45,
          previousBalance: 14887.7,
          newBalance: 14895.15,
          status: 'COMPLETED',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<HistoryPage />);

    expect(screen.queryByText(/Resultado Operativo/i)).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('shows spinner when loading', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<HistoryPage />);
    expect(screen.queryByText('Historial')).not.toBeInTheDocument();
  });

  it('shows error message and retry when error', () => {
    const refetch = vi.fn();
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: null,
      loading: false,
      error: 'Network error',
      refetch,
    });
    render(<HistoryPage />);
    expect(screen.getByText('Ocurrió un error')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reintentar'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows email mapping error when configured', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: null,
      loading: false,
      error: 'Investor email mapping not configured',
      refetch: vi.fn(),
    });
    render(<HistoryPage />);
    expect(screen.getByText(/Falta configurar el mapeo de tu usuario/i)).toBeInTheDocument();
  });

  it('shows Sheets credentials error when configured', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: null,
      loading: false,
      error: 'Google Sheets credentials not configured',
      refetch: vi.fn(),
    });
    render(<HistoryPage />);
    expect(screen.getByText('Google Sheets no está configurado.')).toBeInTheDocument();
  });

  it('shows empty state when no history rows', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<HistoryPage />);
    expect(screen.getByText('Sin movimientos todavía')).toBeInTheDocument();
  });

  it('shows pagination when more than page size rows', () => {
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      code: '001',
      date: `2024-${String(i + 1).padStart(2, '0')}-15T00:00:00.000Z`,
      movement: 'DEPOSIT',
      amount: 100,
      previousBalance: 1000,
      newBalance: 1100,
      status: 'COMPLETED',
    }));
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: manyRows,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<HistoryPage />);
    expect(screen.getAllByText('Página 1 de 2').length).toBeGreaterThanOrEqual(1);
    const nextBtns = screen.getAllByText('Siguiente');
    fireEvent.click(nextBtns[0]);
    expect(screen.getAllByText('Página 2 de 2').length).toBeGreaterThanOrEqual(1);
  });

  it('allows changing desktop page size', () => {
    const manyRows = Array.from({ length: 60 }, (_, i) => ({
      code: '001',
      date: `2024-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-15T00:00:00.000Z`,
      movement: 'DEPOSIT',
      amount: 100,
      previousBalance: 1000,
      newBalance: 1100,
      status: 'COMPLETED',
    }));
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: manyRows,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<HistoryPage />);
    const pageSizeSelects = screen.getAllByDisplayValue('20');
    fireEvent.change(pageSizeSelects[0], { target: { value: '50' } });
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  it('renders trading fee adjustment movement', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: [
        {
          code: '001',
          date: '2026-02-15T19:00:00.000Z',
          movement: 'TRADING_FEE_ADJUSTMENT',
          amount: 10,
          previousBalance: 4955,
          newBalance: 4965,
          status: 'COMPLETED',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<HistoryPage />);

    expect(screen.getAllByText(/Comisión de Trading - Ajuste/i).length).toBeGreaterThan(0);
  });

  it('renders trading fee by withdrawal with percentage and withdrawal amount', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: [
        {
          code: '001',
          date: '2026-02-01T19:00:00.000Z',
          movement: 'TRADING_FEE',
          amount: -45,
          previousBalance: 5000,
          newBalance: 4955,
          status: 'COMPLETED',
          tradingFeeSource: 'WITHDRAWAL',
          tradingFeePercentage: 30,
          tradingFeeWithdrawalAmount: 15000,
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<HistoryPage />);

    expect(screen.getAllByText(/Comisión.*30%.*Retiro.*15,000/i).length).toBeGreaterThan(0);
  });
});
