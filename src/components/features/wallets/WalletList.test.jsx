import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WalletList } from './WalletList';

describe('WalletList', () => {
  it('renders empty state when no wallets', () => {
    render(<WalletList wallets={[]} />);
    expect(screen.getByText('No Wallets Available')).toBeInTheDocument();
  });

  it('renders wallet cards when wallets provided', () => {
    const wallets = [
      { network: 'Bitcoin', address: '1A2B3C', icon: '₿' },
      { network: 'Ethereum', address: '0xABC', icon: 'Ξ' },
    ];
    
    render(<WalletList wallets={wallets} />);
    
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
  });

  it('handles null wallets', () => {
    render(<WalletList wallets={null} />);
    expect(screen.getByText('No Wallets Available')).toBeInTheDocument();
  });
});

