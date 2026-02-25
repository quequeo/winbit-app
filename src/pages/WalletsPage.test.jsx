import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { WalletsPage } from './WalletsPage';

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
  useAuth: () => ({ user: { email: 'test@example.com', displayName: 'Test' } }),
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

vi.mock('../hooks/useInvestorHistory', () => ({
  useInvestorHistory: () => ({ data: [], loading: false, error: null, refetch: vi.fn() }),
}));

describe('WalletsPage', () => {
  it('renders heading and tabs', () => {
    render(<WalletsPage />);
    expect(screen.getByText('Depósitos')).toBeInTheDocument();
    expect(screen.getByText('Depositar')).toBeInTheDocument();
    expect(screen.getByText('Historial de Depósitos')).toBeInTheDocument();
  });

  it('renders deposit option cards in default tab', () => {
    render(<WalletsPage />);
    expect(screen.getByText('Banco Galicia')).toBeInTheDocument();
    expect(screen.getByText('USDT TRC20')).toBeInTheDocument();
    expect(screen.getByText(/Verificá siempre los datos/)).toBeInTheDocument();
  });

  it('renders grouped by category in default tab', () => {
    render(<WalletsPage />);
    expect(screen.getAllByText('Transferencia bancaria ARS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cripto').length).toBeGreaterThan(0);
  });

  it('shows empty state in history tab when no deposits', async () => {
    render(<WalletsPage />);
    await userEvent.click(screen.getByText('Historial de Depósitos'));
    expect(screen.getByText('No hay depósitos registrados aún.')).toBeInTheDocument();
  });
});
