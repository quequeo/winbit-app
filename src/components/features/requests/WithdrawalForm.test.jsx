import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WithdrawalForm } from './WithdrawalForm';
import { createInvestorRequest } from '../../../services/api';
import { i18n } from '../../../i18n';

vi.mock('../../../services/api', () => ({
  createInvestorRequest: vi.fn(),
}));

vi.mock('../../../hooks/usePaymentMethods', () => ({
  usePaymentMethods: (requestType) => {
    if (requestType === 'WITHDRAWAL') {
      // Default (first) method should not require extra fields for tests.
      return {
        paymentMethods: [
          {
            code: 'SWIFT',
            name: 'Transferencia Internacional',
            kind: 'INTERNATIONAL',
            requiresNetwork: false,
            requiresLemontag: false,
          },
          {
            code: 'LEMON_CASH',
            name: 'Lemon Cash',
            kind: 'LEMON_CASH',
            requiresNetwork: false,
            requiresLemontag: true,
          },
        ],
        loading: false,
        error: null,
      };
    }
    return { paymentMethods: [], loading: false, error: null };
  },
}));

describe('WithdrawalForm', () => {
  it('renders English strings when language is en', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    render(<WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />);

    expect(screen.getByText('Request withdrawal')).toBeInTheDocument();
    expect(screen.getByText('Withdrawal type')).toBeInTheDocument();

    const amountInput = screen.getByLabelText(/Amount/);
    expect(amountInput).toHaveAttribute('placeholder', 'Enter amount in USD');

    expect(screen.getByRole('button', { name: 'Send request' })).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage('es');
    });
  });

  it('validates partial amount', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('Ingresá un monto válido')).toBeInTheDocument();
  });

  it('validates amount cannot exceed balance', async () => {
    await i18n.changeLanguage('es');
    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );
    const amountInput = screen.getByLabelText(/Monto/);
    fireEvent.change(amountInput, { target: { value: '200' } });
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('El monto supera el saldo actual')).toBeInTheDocument();
  });

  it('submits full withdrawal (amount disabled)', async () => {
    createInvestorRequest.mockResolvedValueOnce({ data: { id: 1 }, error: null });
    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );

    fireEvent.click(screen.getByLabelText('Total'));
    const amountInput = screen.getByLabelText(/Monto/);
    expect(amountInput).toBeDisabled();

    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(createInvestorRequest).toHaveBeenCalled();
    });
    // Modal should appear with success message
    expect(await screen.findByText('Solicitud registrada')).toBeInTheDocument();
    // Modal should have an "Aceptar" button
    expect(screen.getByRole('button', { name: /Aceptar/i })).toBeInTheDocument();
  });

  it('shows error from service', async () => {
    createInvestorRequest.mockResolvedValueOnce({ data: null, error: 'Nope' });
    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );

    const amountInput = screen.getByLabelText(/Monto/);
    fireEvent.change(amountInput, { target: { value: '10' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('Nope')).toBeInTheDocument();
  });
});
