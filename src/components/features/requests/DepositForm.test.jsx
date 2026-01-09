import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DepositForm } from './DepositForm';
import { sendDepositRequest } from '../../../services/email';
import { createInvestorRequest } from '../../../services/api';
import { i18n } from '../../../i18n';

vi.mock('../../../services/email', () => ({
  sendDepositRequest: vi.fn(),
}));

vi.mock('../../../services/api', () => ({
  createInvestorRequest: vi.fn(),
}));

describe('DepositForm', () => {
  it('renders English strings when language is en', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    render(<DepositForm userName="Test" userEmail="t@e.com" />);

    expect(screen.getByText('Register deposit')).toBeInTheDocument();

    const amountInput = screen.getByLabelText(/Amount/);
    expect(amountInput).toHaveAttribute('placeholder', 'Enter amount in USD');

    // Network fields appear only for crypto (default).
    expect(screen.getByLabelText(/Network/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send request' })).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage('es');
    });
  });

  it('validates amount', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    const { container } = render(<DepositForm userName="Test" userEmail="t@e.com" />);
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ingresá un monto válido');
  });

  it('validates network selection', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    const { container } = render(<DepositForm userName="Test" userEmail="t@e.com" />);
    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '10' } });
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Seleccioná una red');
  });

  it('submits successfully', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    createInvestorRequest.mockResolvedValueOnce({ data: { id: 1 }, error: null });
    sendDepositRequest.mockResolvedValueOnce({ success: true, error: null });
    const { container } = render(<DepositForm userName="Test" userEmail="t@e.com" />);

    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Red/), { target: { value: 'USDT-TRC20' } });
    fireEvent.change(screen.getByLabelText(/Hash de transacción/), {
      target: { value: 'abc' },
    });

    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(createInvestorRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 't@e.com',
          type: 'DEPOSIT',
          amount: 10,
          method: 'USDT',
          network: 'TRC20',
          transactionHash: 'abc',
        }),
      );
    });

    expect(await screen.findByText('Solicitud registrada')).toBeInTheDocument();
  });

  it('shows service error', async () => {
    createInvestorRequest.mockResolvedValueOnce({ data: null, error: 'Fail' });
    sendDepositRequest.mockResolvedValueOnce({ success: false, error: 'Fail' });
    const { container } = render(<DepositForm userName="Test" userEmail="t@e.com" />);

    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Red/), { target: { value: 'USDC-ERC20' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Fail');
  });
});
