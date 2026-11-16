import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { WalletsPage } from './WalletsPage';
import { ToastProvider } from '../components/ui/ToastProvider';
import { createInvestorRequest } from '../services/api';

const renderWithQuery = (ui, { initialEntries = ['/wallets'] } = {}) => {
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

vi.mock('../services/firebase', () => ({
  auth: {},
  googleProvider: {},
  storage: {},
}));

vi.mock('../utils/uploadImage', () => ({
  uploadImage: vi.fn(),
}));

vi.mock('../services/api', () => ({
  createInvestorRequest: vi.fn(),
  getWithdrawalFeePreview: vi.fn(),
  cancelInvestorRequest: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', displayName: 'Test' },
    userEmail: 'test@example.com',
  }),
}));

vi.mock('../hooks/useDepositOptions', () => ({
  useDepositOptions: () => ({
    depositOptions: [
      {
        id: '2',
        category: 'CRYPTO',
        label: 'USDT TRC20',
        currency: 'USDT',
        details: { address: 'TF7j33wo', network: 'TRC20' },
        position: 1,
      },
    ],
    loading: false,
    error: null,
  }),
}));

const { mockUseInvestorHistory } = vi.hoisted(() => ({
  mockUseInvestorHistory: vi.fn(() => ({
    data: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));
vi.mock('../hooks/useInvestorHistory', () => ({
  useInvestorHistory: (...args) => mockUseInvestorHistory(...args),
}));

vi.mock('../hooks/useInvestorData', () => ({
  useInvestorData: () => ({
    data: { balance: 10000, lastUpdated: '2026-01-01T12:00:00Z' },
    loading: false,
    error: null,
  }),
}));

describe('WalletsPage', () => {
  it('renders heading and tabs', () => {
    renderWithQuery(<WalletsPage />);
    expect(screen.getByText('Depósitos')).toBeInTheDocument();
    expect(screen.getByText('Depositar')).toBeInTheDocument();
    expect(screen.getByText('Historial')).toBeInTheDocument();
  });

  it('renders deposit option cards in default tab', () => {
    renderWithQuery(<WalletsPage />);
    expect(screen.getAllByText('USDT TRC20').length).toBeGreaterThan(0);
  });

  it('renders deposit details and report button in default tab', () => {
    renderWithQuery(<WalletsPage />);
    expect(screen.getByText('TF7j33wo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Informar depósito/i })).toBeInTheDocument();
  });

  it('shows empty state in history tab when no deposits', async () => {
    renderWithQuery(<WalletsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Historial'));
    });
    expect(screen.getByText('Sin depósitos todavía')).toBeInTheDocument();
  });

  it('shows deposit form when Informar depósito button is clicked', async () => {
    renderWithQuery(<WalletsPage />);
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Informar depósito/i }));
    });
    expect(screen.getByLabelText(/Monto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Método/i)).toHaveTextContent('USDT TRC20');
  });

  it('shows view receipt button when deposit has attachmentUrl', async () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [
        {
          id: 'request_1',
          movement: 'DEPOSIT',
          amount: 100,
          date: '2026-01-01T12:00:00Z',
          status: 'PENDING',
          method: 'USDT',
          attachmentUrl: 'https://example.com/receipt.jpg',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithQuery(<WalletsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Historial'));
    });

    expect(screen.getAllByRole('button', { name: /Ver detalle/i }).length).toBeGreaterThan(0);
  });

  it('shows deposit rows in history when deposits exist', async () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [
        {
          id: 'ph-1',
          date: '2024-01-15T12:00:00.000Z',
          movement: 'DEPOSIT',
          amount: 1000,
          previousBalance: 0,
          newBalance: 1000,
          status: 'COMPLETED',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithQuery(<WalletsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Historial'));
    });
    expect(screen.getAllByText('USD 1.000,00').length).toBeGreaterThan(0);

    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('opens the deposit form prefilled to correct a pending request', async () => {
    mockUseInvestorHistory.mockReturnValue({
      data: [
        {
          id: 'request_dep-1',
          movement: 'DEPOSIT',
          amount: 750,
          date: '2026-01-05T12:00:00Z',
          status: 'PENDING',
          method: 'USDT',
          network: 'TRC20',
          attachmentUrl: 'https://example.com/original.jpg',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    createInvestorRequest.mockResolvedValue({
      data: { id: 'dep-2', status: 'PENDING' },
      error: null,
    });

    renderWithQuery(<WalletsPage />, {
      initialEntries: ['/wallets?tab=history&correct=request_dep-1'],
    });

    expect(await screen.findByTestId('request-correction-note')).toHaveTextContent(
      'Estás corrigiendo la solicitud de depósito de USD 750,00 del 5 Jan 2026.',
    );
    expect(screen.getByLabelText(/Monto/i)).toHaveValue(750);
    expect(screen.getByLabelText(/Método/i)).toHaveTextContent('USDT TRC20');
    expect(
      screen.getByText(
        'Se usa el comprobante de la solicitud original. Si subís otro, lo reemplaza.',
      ),
    ).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Enviar corrección' }));
    });

    await waitFor(() =>
      expect(createInvestorRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DEPOSIT',
          amount: 750,
          method: 'USDT',
          attachmentUrl: 'https://example.com/original.jpg',
          replacesRequestId: 'dep-1',
        }),
      ),
    );
    expect(await screen.findByText('Solicitud corregida')).toBeInTheDocument();

    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });
});
