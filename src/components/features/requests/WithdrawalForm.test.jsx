import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WithdrawalForm } from './WithdrawalForm';
import { sendWithdrawalRequest } from '../../../services/email';

vi.mock('../../../services/email', () => ({
  sendWithdrawalRequest: vi.fn(),
}));

describe('WithdrawalForm', () => {
  it('validates partial amount', async () => {
    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('Ingresá un monto válido')).toBeInTheDocument();
  });

  it('validates amount cannot exceed balance', async () => {
    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );
    const amountInput = screen.getByLabelText(/Monto/);
    fireEvent.change(amountInput, { target: { value: '200' } });
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('El monto supera el saldo actual')).toBeInTheDocument();
  });

  it('submits full withdrawal (amount disabled)', async () => {
    sendWithdrawalRequest.mockResolvedValueOnce({ success: true, error: null });
    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );

    fireEvent.click(screen.getByLabelText('Total'));
    const amountInput = screen.getByLabelText(/Monto/);
    expect(amountInput).toBeDisabled();

    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(sendWithdrawalRequest).toHaveBeenCalled();
    });
    expect(await screen.findByText('Solicitud registrada')).toBeInTheDocument();
  });

  it('shows error from service', async () => {
    sendWithdrawalRequest.mockResolvedValueOnce({ success: false, error: 'Nope' });
    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );

    const amountInput = screen.getByLabelText(/Monto/);
    fireEvent.change(amountInput, { target: { value: '10' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('Nope')).toBeInTheDocument();
  });
});
