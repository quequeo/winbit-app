import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OperatingPage } from './OperatingPage';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'test@example.com' }, userEmail: 'test@example.com' }),
}));

const mockUseInvestorHistory = vi.fn();
vi.mock('../hooks/useInvestorHistory', () => ({
  useInvestorHistory: (...args) => mockUseInvestorHistory(...args),
}));

describe('OperatingPage', () => {
  beforeEach(() => {
    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('shows spinner when loading', () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<OperatingPage />);
    expect(screen.queryByText('Operativa')).not.toBeInTheDocument();
  });

  it('shows error message and retry when error', () => {
    const refetch = vi.fn();
    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: false,
      error: 'Google Sheets credentials not configured',
      refetch,
    });
    render(<OperatingPage />);
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
    render(<OperatingPage />);
    expect(screen.getByText(/Falta configurar el mapeo/i)).toBeInTheDocument();
  });

  it('shows empty state when no operating results', () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<OperatingPage />);
    expect(screen.getByText('Operativa')).toBeInTheDocument();
    expect(screen.getByText('Sin operativas todavía')).toBeInTheDocument();
  });

  it('renders only operating_result rows and hides status column', () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [
        {
          code: '001',
          date: '2025-12-02T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: 10,
          previousBalance: 100,
          newBalance: 110,
          status: 'COMPLETED',
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

    render(<OperatingPage />);

    expect(screen.getByText('Operativa')).toBeInTheDocument();

    // Shows operating_result amount
    expect(screen.getAllByText(/\$10\.00/).length).toBeGreaterThan(0);

    // Shows movement column/value
    expect(screen.getAllByText(/Resultado operativo\s+\+10\.00%/i).length).toBeGreaterThan(0);

    // Should not show deposit movement (since we filter)
    expect(screen.queryByText('Depósito')).not.toBeInTheDocument();

    // No status column header
    expect(screen.queryByText(/Estado/i)).not.toBeInTheDocument();
  });

  it('shows pagination when more than 20 rows', async () => {
    const rows = Array.from({ length: 25 }, (_, i) => ({
      code: '001',
      date: `2025-12-${String(i + 1).padStart(2, '0')}T17:00:00.000Z`,
      movement: 'OPERATING_RESULT',
      amount: i % 2 === 0 ? 10 : -5,
      previousBalance: 100,
      newBalance: i % 2 === 0 ? 110 : 95,
      status: 'COMPLETED',
    }));
    mockUseInvestorHistory.mockReturnValue({
      data: rows,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<OperatingPage />);
    expect(screen.getAllByText('Página 1 de 2').length).toBeGreaterThan(0);
    const nextBtns = screen.getAllByRole('button', { name: 'Siguiente' });
    await act(async () => {
      await userEvent.click(nextBtns[0]);
    });
    expect(screen.getAllByText('Página 2 de 2').length).toBeGreaterThan(0);
  });

  it('shows negative amount in red', () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [
        {
          code: '001',
          date: '2025-12-01T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: -15,
          previousBalance: 100,
          newBalance: 85,
          status: 'COMPLETED',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<OperatingPage />);
    expect(screen.getAllByText('-$15.00').length).toBeGreaterThan(0);
  });
});
