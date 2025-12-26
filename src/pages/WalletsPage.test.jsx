import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletsPage } from './WalletsPage';

vi.mock('../config/wallets', () => ({
  WALLETS: [
    { network: 'Bitcoin (BTC)', address: 'abc', icon: '₿' },
    { network: 'Ethereum (ETH)', address: 'def', icon: 'Ξ' },
  ],
}));

describe('WalletsPage', () => {
  it('renders heading and wallet cards', () => {
    render(<WalletsPage />);
    expect(screen.getByText('Depósitos')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin (BTC)')).toBeInTheDocument();
    expect(screen.getByText('Ethereum (ETH)')).toBeInTheDocument();
    expect(screen.getByText(/Verificá siempre la red/)).toBeInTheDocument();
  });
});
