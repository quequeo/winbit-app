import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DepositOptionCard } from './DepositOptionCard';

describe('DepositOptionCard', () => {
  const bankOption = {
    id: '1',
    category: 'BANK_ARS',
    label: 'Banco Galicia',
    currency: 'ARS',
    details: { bank_name: 'Galicia', holder: 'Winbit SRL', cbu_cvu: '0070000000' },
  };

  const cryptoOption = {
    id: '2',
    category: 'CRYPTO',
    label: 'USDT TRC20',
    currency: 'USDT',
    details: { address: 'TF7j33woKnMVFALtvRVdnFWnneNrUCVvAr', network: 'TRC20' },
  };

  it('renders bank option details', () => {
    render(<DepositOptionCard option={bankOption} />);
    expect(screen.getByText('Banco Galicia')).toBeInTheDocument();
    expect(screen.getByText('ARS')).toBeInTheDocument();
    expect(screen.getByText('Galicia')).toBeInTheDocument();
    expect(screen.getByText('Winbit SRL')).toBeInTheDocument();
    expect(screen.getByText('0070000000')).toBeInTheDocument();
  });

  it('renders crypto option details', () => {
    render(<DepositOptionCard option={cryptoOption} />);
    expect(screen.getByText('USDT TRC20')).toBeInTheDocument();
    expect(screen.getByText('TF7j33woKnMVFALtvRVdnFWnneNrUCVvAr')).toBeInTheDocument();
    expect(screen.getByText('TRC20')).toBeInTheDocument();
  });

  it('has copy buttons for copyable fields', () => {
    render(<DepositOptionCard option={bankOption} />);
    const copyButtons = screen.getAllByRole('button', { name: /Copiar/i });
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  it('copies text to clipboard on button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<DepositOptionCard option={bankOption} />);
    const copyButtons = screen.getAllByRole('button', { name: /Copiar/i });
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('0070000000');
    });
  });
});
