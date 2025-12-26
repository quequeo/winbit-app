import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DepositForm } from './DepositForm';
import { sendDepositRequest } from '../../../services/email';

vi.mock('../../../services/email', () => ({
  sendDepositRequest: vi.fn(),
}));

describe('DepositForm', () => {
  it('validates amount', async () => {
    const { container } = render(<DepositForm userName="Test" userEmail="t@e.com" />);
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ingresá un monto válido');
  });

  it('validates network selection', async () => {
    const { container } = render(<DepositForm userName="Test" userEmail="t@e.com" />);
    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '10' } });
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Seleccioná una red');
  });

  it('submits successfully', async () => {
    sendDepositRequest.mockResolvedValueOnce({ success: true, error: null });
    const { container } = render(<DepositForm userName="Test" userEmail="t@e.com" />);

    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Red/), { target: { value: 'USDT-TRC20' } });
    fireEvent.change(screen.getByLabelText(/Hash de transacción/), {
      target: { value: 'abc' },
    });

    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(sendDepositRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: 'Test',
          userEmail: 't@e.com',
          amount: '$10.00',
          method: 'crypto',
          network: 'USDT-TRC20',
          transactionHash: 'abc',
        }),
      );
    });

    expect(await screen.findByText('Solicitud registrada')).toBeInTheDocument();
  });

  it('shows service error', async () => {
    sendDepositRequest.mockResolvedValueOnce({ success: false, error: 'Fail' });
    const { container } = render(<DepositForm userName="Test" userEmail="t@e.com" />);

    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Red/), { target: { value: 'USDC-ERC20' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Fail');
  });
});
