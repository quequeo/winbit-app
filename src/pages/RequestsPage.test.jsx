import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RequestsPage } from './RequestsPage';
import { ToastProvider } from '../components/ui/ToastProvider';
import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';
import { useInvestorHistory } from '../hooks/useInvestorHistory';

vi.mock('../hooks/useAuth');
vi.mock('../hooks/useInvestorData');
vi.mock('../hooks/useInvestorHistory');
vi.mock('../components/features/requests/WithdrawalForm', () => ({
  WithdrawalForm: ({ correction, availableBalance, onCorrectionDone, onCorrectionDismiss }) => (
    <div>
      <div>WithdrawalForm</div>
      {correction ? (
        <>
          <div data-testid="correction-id">{correction.id}</div>
          <div data-testid="available-balance">{availableBalance}</div>
          <button type="button" onClick={() => onCorrectionDone({ amount: 300 })}>
            mock-correction-done
          </button>
          <button type="button" onClick={onCorrectionDismiss}>
            mock-correction-dismiss
          </button>
        </>
      ) : null}
    </div>
  ),
}));

const renderPage = (ui, { initialEntries = ['/requests'] } = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter
      initialEntries={initialEntries}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{ui}</ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

describe('RequestsPage', () => {
  const mockAuth = {
    user: { email: 'test@example.com', displayName: 'Juan' },
    userEmail: 'test@example.com',
  };
  const mockData = {
    data: { name: 'Juan', balance: 1000 },
    loading: false,
    error: null,
    refetch: vi.fn(),
  };
  const mockHistory = { data: [], loading: false, error: null, refetch: vi.fn() };

  it('shows skeleton while investor data is loading', () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue({ ...mockData, loading: true });
    useInvestorHistory.mockReturnValue(mockHistory);
    const { container } = renderPage(<RequestsPage />);
    expect(container.querySelector('.wb-skeleton')).toBeInTheDocument();
  });

  it('renders tabs when loaded', () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue(mockData);
    useInvestorHistory.mockReturnValue(mockHistory);
    renderPage(<RequestsPage />);
    expect(screen.getByText('Nueva solicitud')).toBeInTheDocument();
    expect(screen.getByText('Historial de retiros')).toBeInTheDocument();
  });

  it('shows withdrawal form by default', () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue(mockData);
    useInvestorHistory.mockReturnValue(mockHistory);
    renderPage(<RequestsPage />);
    expect(screen.getByText('WithdrawalForm')).toBeInTheDocument();
  });

  it('shows loading skeleton when history tab is loading', async () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue(mockData);
    useInvestorHistory.mockReturnValue({ ...mockHistory, loading: true });
    const { container } = renderPage(<RequestsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Historial de retiros'));
    });
    expect(container.querySelector('.wb-skeleton')).toBeInTheDocument();
  });

  it('shows empty state when no withdrawals in history', async () => {
    useAuth.mockReturnValue(mockAuth);
    useInvestorData.mockReturnValue(mockData);
    useInvestorHistory.mockReturnValue(mockHistory);
    renderPage(<RequestsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Historial de retiros'));
    });
    expect(screen.getByText('Sin retiros todavía')).toBeInTheDocument();
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
    renderPage(<RequestsPage />);
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
    renderPage(<RequestsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Historial de retiros'));
    });
    expect(screen.getAllByText('UNKNOWN_STATUS').length).toBeGreaterThan(0);
  });

  describe('pending request actions', () => {
    const pendingWithdrawal = {
      id: 'request_abc-123',
      movement: 'WITHDRAWAL',
      amount: 200,
      status: 'PENDING',
      date: '2025-02-01T18:00:00Z',
      method: 'USDT',
      network: 'TRC20',
    };

    it('shows Corregir and Cancelar solicitud only on pending requests', async () => {
      useAuth.mockReturnValue(mockAuth);
      useInvestorData.mockReturnValue(mockData);
      useInvestorHistory.mockReturnValue({
        data: [
          pendingWithdrawal,
          {
            id: 'request_def-456',
            movement: 'WITHDRAWAL',
            amount: 150,
            status: 'CANCELLED',
            date: '2025-01-20T18:00:00Z',
            method: 'USDT',
          },
          {
            id: 'ph-1',
            movement: 'WITHDRAWAL',
            amount: 100,
            status: 'COMPLETED',
            date: '2025-01-10T18:00:00Z',
            method: 'USDT',
          },
        ],
        loading: false,
        error: null,
      });
      renderPage(<RequestsPage />);
      await act(async () => {
        await userEvent.click(screen.getByText('Historial de retiros'));
      });

      expect(screen.getAllByRole('button', { name: 'Corregir' })).toHaveLength(1);
      expect(screen.getAllByRole('button', { name: 'Cancelar solicitud' })).toHaveLength(1);
      expect(screen.getByText('Cancelado')).toBeInTheDocument();
    });

    it('opens the form in correction mode from ?correct= and frees the original amount', () => {
      useAuth.mockReturnValue(mockAuth);
      useInvestorData.mockReturnValue(mockData);
      useInvestorHistory.mockReturnValue({
        data: [pendingWithdrawal],
        loading: false,
        error: null,
      });
      renderPage(<RequestsPage />, {
        initialEntries: ['/requests?tab=history&correct=request_abc-123'],
      });

      expect(screen.getByTestId('correction-id')).toHaveTextContent('request_abc-123');
      // Saldo 1000 - 200 pendientes + 200 de la solicitud que se corrige.
      expect(screen.getByTestId('available-balance')).toHaveTextContent('1000');
    });

    it('ignores ?correct= when the request is no longer pending', () => {
      useAuth.mockReturnValue(mockAuth);
      useInvestorData.mockReturnValue(mockData);
      useInvestorHistory.mockReturnValue({
        data: [{ ...pendingWithdrawal, status: 'COMPLETED' }],
        loading: false,
        error: null,
      });
      renderPage(<RequestsPage />, { initialEntries: ['/requests?correct=request_abc-123'] });

      expect(screen.getByText('WithdrawalForm')).toBeInTheDocument();
      expect(screen.queryByTestId('correction-id')).not.toBeInTheDocument();
    });

    it('shows a toast and the history after the correction is sent', async () => {
      useAuth.mockReturnValue(mockAuth);
      useInvestorData.mockReturnValue(mockData);
      useInvestorHistory.mockReturnValue({
        data: [pendingWithdrawal],
        loading: false,
        error: null,
      });
      renderPage(<RequestsPage />, { initialEntries: ['/requests?correct=request_abc-123'] });

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'mock-correction-done' }));
      });

      expect(screen.getByText('Solicitud corregida')).toBeInTheDocument();
      expect(
        screen.getByText('La solicitud de retiro quedó en USD 300,00. La anterior fue cancelada.'),
      ).toBeInTheDocument();
      expect(screen.queryByText('WithdrawalForm')).not.toBeInTheDocument();
    });
  });
});
