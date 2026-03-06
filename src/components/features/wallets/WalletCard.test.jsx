import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletCard } from './WalletCard';

describe('WalletCard', () => {
  const defaultProps = {
    network: 'USDT (TRC20)',
    address: '1A2B3C4D5E6F7G8H9I0J',
  };

  it('renders network name and truncated address', () => {
    render(<WalletCard {...defaultProps} />);
    expect(screen.getByText('USDT (TRC20)')).toBeInTheDocument();
    expect(screen.getByText(/1A2B3C4D/)).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<WalletCard {...defaultProps} icon="₿" />);
    expect(screen.getByText('₿')).toBeInTheDocument();
  });

  it('copies address to clipboard on button click', async () => {
    render(<WalletCard {...defaultProps} />);

    const copyButton = screen.getByText('Copiar');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.address);

    await waitFor(() => {
      expect(screen.getByText('✓ ¡Copiado!')).toBeInTheDocument();
    });
  });

  it('shows copied state after clicking copy button', async () => {
    render(<WalletCard {...defaultProps} />);

    const copyButton = screen.getByText('Copiar');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('✓ ¡Copiado!')).toBeInTheDocument();
    });
  });

  it('handles clipboard error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const originalWriteText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));

    render(<WalletCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Copiar'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
    expect(screen.getByText('Copiar')).toBeInTheDocument();

    navigator.clipboard.writeText = originalWriteText;
    consoleSpy.mockRestore();
  });
});
