import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletsPage } from './WalletsPage';

const renderWithQuery = (ui) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
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
        id: '1',
        category: 'BANK_ARS',
        label: 'Banco Galicia',
        currency: 'ARS',
        details: { bank_name: 'Galicia', holder: 'Winbit SRL', cbu_cvu: '0070000' },
        position: 1,
      },
      {
        id: '2',
        category: 'CRYPTO',
        label: 'USDT TRC20',
        currency: 'USDT',
        details: { address: 'TF7j33wo', network: 'TRC20' },
        position: 2,
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

describe('WalletsPage', () => {
  it('renders heading and tabs', () => {
    renderWithQuery(<WalletsPage />);
    expect(screen.getByText('Depósitos')).toBeInTheDocument();
    expect(screen.getByText('Métodos Disponibles')).toBeInTheDocument();
    expect(screen.getByText('Registrar Depósito')).toBeInTheDocument();
    expect(screen.getByText('Historial')).toBeInTheDocument();
  });

  it('renders deposit option cards in default tab', () => {
    renderWithQuery(<WalletsPage />);
    expect(screen.getByText('Banco Galicia')).toBeInTheDocument();
    expect(screen.getByText('USDT TRC20')).toBeInTheDocument();
  });

  it('renders grouped by category in default tab', () => {
    renderWithQuery(<WalletsPage />);
    expect(screen.getAllByText('Transferencia bancaria ARS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cripto').length).toBeGreaterThan(0);
  });

  it('shows empty state in history tab when no deposits', async () => {
    renderWithQuery(<WalletsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Historial'));
    });
    expect(screen.getByText('No hay depósitos registrados aún.')).toBeInTheDocument();
  });

  it('shows deposit form when Registrar Depósito tab is selected', async () => {
    renderWithQuery(<WalletsPage />);
    await act(async () => {
      await userEvent.click(screen.getByText('Registrar Depósito'));
    });
    expect(screen.getByText(/Registrar depósito/)).toBeInTheDocument();
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
    expect(screen.getAllByText('$1.000,00').length).toBeGreaterThan(0);

    mockUseInvestorHistory.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });
});
