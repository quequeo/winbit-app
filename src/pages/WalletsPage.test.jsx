import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletsPage } from './WalletsPage';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'test@example.com', displayName: 'Test' } }),
}));

vi.mock('../hooks/useWallets', () => ({
  useWallets: () => ({
    wallets: [
      { network: 'USDT (TRC20)', address: 'abc', icon: '₮' },
      { network: 'USDC (TRC20)', address: 'def', icon: '$' },
    ],
    loading: false,
    error: null,
  }),
}));

describe('WalletsPage', () => {
  it('renders heading and wallet cards', () => {
    render(<WalletsPage />);
    expect(screen.getByText('Depósitos')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'USDT (TRC20)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'USDC (TRC20)' })).toBeInTheDocument();
    expect(screen.getByText(/Verificá siempre la red/)).toBeInTheDocument();
  });
});
