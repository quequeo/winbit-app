import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { RequestsPage } from './RequestsPage';
import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';
import { useInvestorHistory } from '../hooks/useInvestorHistory';

vi.mock('../hooks/useAuth');
vi.mock('../hooks/useInvestorData');
vi.mock('../hooks/useInvestorHistory');
vi.mock('../components/features/requests/WithdrawalForm', () => ({
  WithdrawalForm: () => <div>WithdrawalForm</div>,
}));

describe('RequestsPage', () => {
  const mockAuth = { user: { email: 'test@example.com', displayName: 'Juan' } };
  const mockData = {
    data: { name: 'Juan', balance: 1000 },
    loading: false,
    error: null,
    refetch: vi.fn(),
  };
  const mockHistory = { data: [], loading: false, error: null, refetch: vi.fn() };

  it('shows spinner while investor data is loading', () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue({ ...mockData, loading: true });
    useInvestorHistory.mockReturnValue(mockHistory);
    render(<RequestsPage />);
    expect(screen.queryByText('Nueva solicitud')).not.toBeInTheDocument();
  });

  it('renders tabs when loaded', () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue(mockData);
    useInvestorHistory.mockReturnValue(mockHistory);
    render(<RequestsPage />);
    expect(screen.getByText('Nueva solicitud')).toBeInTheDocument();
    expect(screen.getByText('Historial de retiros')).toBeInTheDocument();
  });

  it('shows withdrawal form by default', () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue(mockData);
    useInvestorHistory.mockReturnValue(mockHistory);
    render(<RequestsPage />);
    expect(screen.getByText('WithdrawalForm')).toBeInTheDocument();
  });

  it('shows loading spinner when history tab is loading', async () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue(mockData);
    useInvestorHistory.mockReturnValue({ ...mockHistory, loading: true });
    const { container } = render(<RequestsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Historial de retiros'));
    });
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state when no withdrawals in history', async () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue(mockData);
    useInvestorHistory.mockReturnValue(mockHistory);
    render(<RequestsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Historial de retiros'));
    });
    expect(screen.getByText('No hay retiros registrados aún.')).toBeInTheDocument();
  });

  it('shows withdrawal rows filtered from history', async () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue(mockData);
    useInvestorHistory.mockReturnValue({
      data: [
        {
          id: '1',
          movement: 'WITHDRAWAL',
          amount: 500,
          status: 'COMPLETED',
          date: '2025-01-15T18:00:00Z',
          method: 'USDC',
        },
        {
          id: '2',
          movement: 'DEPOSIT',
          amount: 1000,
          status: 'COMPLETED',
          date: '2025-01-10T18:00:00Z',
          method: null,
        },
        {
          id: '3',
          movement: 'WITHDRAWAL',
          amount: 200,
          status: 'PENDING',
          date: '2025-02-01T18:00:00Z',
          method: 'CASH_USD',
        },
      ],
      loading: false,
      error: null,
    });
    render(<RequestsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Historial de retiros'));
    });
    expect(screen.getAllByText('Completado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
    expect(screen.queryByText('Depósito')).not.toBeInTheDocument();
  });

  it('shows fallback label for unknown status', async () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue(mockData);
    useInvestorHistory.mockReturnValue({
      data: [
        {
          id: '1',
          movement: 'WITHDRAWAL',
          amount: 100,
          status: 'UNKNOWN_STATUS',
          date: '2025-01-15T18:00:00Z',
          method: 'USDC',
        },
      ],
      loading: false,
      error: null,
    });
    render(<RequestsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Historial de retiros'));
    });
    expect(screen.getAllByText('UNKNOWN_STATUS').length).toBeGreaterThan(0);
  });
});
