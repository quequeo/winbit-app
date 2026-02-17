import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletsPage } from './WalletsPage';

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

describe('WalletsPage', () => {
  it('renders heading and deposit option cards', () => {
    render(<WalletsPage />);
    expect(screen.getByText('Depósitos')).toBeInTheDocument();
    expect(screen.getByText('Banco Galicia')).toBeInTheDocument();
    expect(screen.getByText('USDT TRC20')).toBeInTheDocument();
    expect(screen.getByText(/Verificá siempre los datos/)).toBeInTheDocument();
  });

  it('renders grouped by category', () => {
    render(<WalletsPage />);
    expect(screen.getAllByText('Transferencia bancaria ARS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cripto').length).toBeGreaterThan(0);
  });
});
