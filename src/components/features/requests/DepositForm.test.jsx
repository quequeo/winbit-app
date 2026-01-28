import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DepositForm } from './DepositForm';
import { createInvestorRequest } from '../../../services/api';
import { i18n } from '../../../i18n';

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
    expect(amountInput).toHaveAttribute('placeholder', '1000');
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

  it('submits successfully', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    createInvestorRequest.mockResolvedValueOnce({ data: { id: 1 }, error: null });
    const { container } = render(<DepositForm userName="Test" userEmail="t@e.com" />);

    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '10' } });

    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(createInvestorRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 't@e.com',
          type: 'DEPOSIT',
          amount: 10,
          method: 'CASH_ARS',
          network: null,
          transactionHash: null,
          attachmentUrl: null,
        }),
      );
    });

    // Modal should appear with success message
    expect(await screen.findByText('Solicitud registrada')).toBeInTheDocument();
    // Modal should have an "Aceptar" button
    expect(screen.getByRole('button', { name: /Aceptar/i })).toBeInTheDocument();
  });

  it('shows service error', async () => {
    createInvestorRequest.mockResolvedValueOnce({ data: null, error: 'Fail' });
    const { container } = render(<DepositForm userName="Test" userEmail="t@e.com" />);

    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '10' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Fail');
  });
});
