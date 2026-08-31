import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AccountActivityCard } from './AccountActivityCard';

describe('AccountActivityCard', () => {
  it('renders movement hierarchy with amount on the right', () => {
    render(
      <AccountActivityCard
        title="Depósito aprobado"
        dateTime="20 Jun 2026 · 16:29"
        description="Ingreso de capital vía USDT"
        balanceImpact="Saldo: USD 7.500,00 → USD 8.000,00"
        amount="+USD 500,00"
        amountTone="text-positive"
      />,
    );

    expect(screen.getByText('Depósito aprobado')).toBeInTheDocument();
    expect(screen.getByText('20 Jun 2026 · 16:29')).toBeInTheDocument();
    expect(screen.getByText('Ingreso de capital vía USDT')).toBeInTheDocument();
    expect(screen.getByText('+USD 500,00')).toBeInTheDocument();
  });

  it('renders detail line and secondary action button', () => {
    const onSecondaryAction = vi.fn();

    render(
      <AccountActivityCard
        title="Depósito aprobado"
        dateTime="20 Jun 2026 · 16:29"
        description="Ingreso de capital vía USDT"
        detailLine="Rentabilidad diaria: +0,42%"
        balanceImpact="Saldo: USD 7.500,00 → USD 8.000,00"
        amount="+USD 500,00"
        amountTone="text-positive"
        secondaryAction={{ label: 'Ver comprobante', type: 'button' }}
        onSecondaryAction={onSecondaryAction}
      />,
    );

    expect(screen.getByText('Rentabilidad diaria: +0,42%')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Ver comprobante'));
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('renders secondary link action', () => {
    render(
      <MemoryRouter>
        <AccountActivityCard
          title="Resultado operativo diario"
          dateTime="20 Jun 2026 · 16:29"
          description="Actualización de capital por gestión operativa"
          balanceImpact="Saldo: USD 7.500,00 → USD 8.000,00"
          amount="+USD 500,00"
          amountTone="text-positive"
          secondaryAction={{
            label: 'Ver detalle operativo',
            type: 'link',
            href: '/operating',
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Ver detalle operativo' })).toHaveAttribute(
      'href',
      '/operating',
    );
  });
});
