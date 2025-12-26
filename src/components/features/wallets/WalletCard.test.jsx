import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletCard } from './WalletCard';

describe('WalletCard', () => {
  const defaultProps = {
    network: 'Bitcoin',
    address: '1A2B3C4D5E6F7G8H9I0J',
  };

  it('renders network name and truncated address', () => {
    render(<WalletCard {...defaultProps} />);
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText(/1A2B3C4D/)).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<WalletCard {...defaultProps} icon="₿" />);
    expect(screen.getByText('₿')).toBeInTheDocument();
  });

  it('copies address to clipboard on button click', async () => {
    render(<WalletCard {...defaultProps} />);
    
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.address);
    
    await waitFor(() => {
      expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
    });
  });

  it('resets copied state after timeout', async () => {
    vi.useFakeTimers();
    render(<WalletCard {...defaultProps} />);
    
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    expect(screen.getByText('✓ Copied!')).toBeInTheDocument();

    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

