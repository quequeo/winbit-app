import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WalletList } from './WalletList';

describe('WalletList', () => {
  it('renders empty state when no wallets', () => {
    render(<WalletList wallets={[]} />);
    expect(screen.getByText('No hay wallets disponibles')).toBeInTheDocument();
  });

  it('renders wallet cards when wallets provided', () => {
    const wallets = [
      { network: 'USDT (TRC20)', address: 'TABC123', icon: '₮' },
      { network: 'USDC (TRC20)', address: 'TDEF456', icon: '$' },
    ];

    render(<WalletList wallets={wallets} />);

    expect(screen.getByText('USDT (TRC20)')).toBeInTheDocument();
    expect(screen.getByText('USDC (TRC20)')).toBeInTheDocument();
  });

  it('handles null wallets', () => {
    render(<WalletList wallets={null} />);
    expect(screen.getByText('No hay wallets disponibles')).toBeInTheDocument();
  });
});
