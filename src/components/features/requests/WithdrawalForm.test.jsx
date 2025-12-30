import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WithdrawalForm } from './WithdrawalForm';
import { sendWithdrawalRequest } from '../../../services/email';
import { i18n } from '../../../i18n';

vi.mock('../../../services/email', () => ({
  sendWithdrawalRequest: vi.fn(),
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
