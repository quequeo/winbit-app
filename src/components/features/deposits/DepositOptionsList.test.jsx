import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DepositOptionsList } from './DepositOptionsList';

describe('DepositOptionsList', () => {
  const mockOptions = [
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
    {
      id: '3',
      category: 'LEMON',
      label: 'Lemon Cash',
      currency: 'ARS',
      details: { lemon_tag: '$winbit' },
      position: 3,
    },
  ];

  it('renders options grouped by category', () => {
    render(<DepositOptionsList options={mockOptions} />);

    expect(screen.getByText('Transferencia bancaria ARS')).toBeInTheDocument();
    expect(screen.getAllByText('Lemon Cash').length).toBeGreaterThan(0);
    expect(screen.getByText('Cripto')).toBeInTheDocument();
  });

  it('renders all option labels', () => {
    render(<DepositOptionsList options={mockOptions} />);

    expect(screen.getByText('Banco Galicia')).toBeInTheDocument();
    expect(screen.getByText('USDT TRC20')).toBeInTheDocument();
  });

  it('renders empty state when no options', () => {
    render(<DepositOptionsList options={[]} />);
    expect(screen.getByText(/No hay opciones disponibles/)).toBeInTheDocument();
  });

  it('renders empty state when options is null', () => {
    render(<DepositOptionsList options={null} />);
    expect(screen.getByText(/No hay opciones disponibles/)).toBeInTheDocument();
  });
});
