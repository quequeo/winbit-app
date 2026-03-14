import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WithdrawalForm } from './WithdrawalForm';
import { createInvestorRequest, getWithdrawalFeePreview } from '../../../services/api';
import { i18n } from '../../../i18n';

vi.mock('../../../services/api', () => ({
  createInvestorRequest: vi.fn(),
  getWithdrawalFeePreview: vi.fn(),
}));

const defaultPreview = {
  data: {
    withdrawalAmount: 50,
    feeAmount: 0,
    feePercentage: 30,
    realizedProfit: 0,
    pendingProfit: 0,
    hasFee: false,
  },
  error: null,
};

const previewWithFee = {
  data: {
    withdrawalAmount: 50,
    feeAmount: 15,
    feePercentage: 30,
    realizedProfit: 50,
    pendingProfit: 100,
    hasFee: true,
  },
  error: null,
};

describe('WithdrawalForm', () => {
  it('renders English strings when language is en', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    render(<WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />);

    expect(screen.getAllByText('Request withdrawal').length).toBeGreaterThan(0);
    expect(screen.getByText('Withdrawal type')).toBeInTheDocument();

    const amountInput = screen.getByLabelText(/Amount/);
    expect(amountInput).toHaveAttribute('placeholder', '1,000.00');

    expect(screen.getByRole('button', { name: 'Request withdrawal' })).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage('es');
    });
  });

  it('validates partial amount without calling the API', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('Ingresá un monto válido')).toBeInTheDocument();
    expect(getWithdrawalFeePreview).not.toHaveBeenCalled();
  });

  it('validates amount cannot exceed balance without calling the API', async () => {
    await i18n.changeLanguage('es');
    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );
    const amountInput = screen.getByLabelText(/Monto/);
    fireEvent.change(amountInput, { target: { value: '200' } });
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('El monto supera el saldo actual')).toBeInTheDocument();
    expect(getWithdrawalFeePreview).not.toHaveBeenCalled();
  });

  it('shows confirmation modal with no-fee message when no trading fee applies', async () => {
    getWithdrawalFeePreview.mockResolvedValueOnce(defaultPreview);

    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );

    const amountInput = screen.getByLabelText(/Monto/);
    fireEvent.change(amountInput, { target: { value: '50' } });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Confirmar retiro')).toBeInTheDocument();
    });

    expect(
      screen.getByText('No hay comisión de trading aplicable a este retiro.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('shows confirmation modal with fee breakdown when trading fee applies', async () => {
    getWithdrawalFeePreview.mockResolvedValueOnce(previewWithFee);

    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );

    const amountInput = screen.getByLabelText(/Monto/);
    fireEvent.change(amountInput, { target: { value: '50' } });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Confirmar retiro')).toBeInTheDocument();
    });

    expect(screen.getByText(/Comisión de trading \(30%\)/)).toBeInTheDocument();
    expect(screen.getByText('Total debitado del portfolio')).toBeInTheDocument();
  });

  it('cancelling the confirm modal does not submit the request', async () => {
    getWithdrawalFeePreview.mockResolvedValueOnce(defaultPreview);

    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );

    const amountInput = screen.getByLabelText(/Monto/);
    fireEvent.change(amountInput, { target: { value: '50' } });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Confirmar retiro')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(screen.queryByText('Confirmar retiro')).not.toBeInTheDocument();
    });

    expect(createInvestorRequest).not.toHaveBeenCalled();
  });

  it('submits request and shows success modal after confirm', async () => {
    getWithdrawalFeePreview.mockResolvedValueOnce(defaultPreview);
    createInvestorRequest.mockResolvedValueOnce({ data: { id: 1 }, error: null });

    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );

    const amountInput = screen.getByLabelText(/Monto/);
    fireEvent.change(amountInput, { target: { value: '50' } });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Confirmar retiro')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(createInvestorRequest).toHaveBeenCalledWith({
        email: 't@e.com',
        type: 'WITHDRAWAL',
        amount: 50,
        method: 'CASH_USD',
        network: null,
        lemontag: null,
      });
    });

    expect(await screen.findByText('Retiro solicitado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aceptar/i })).toBeInTheDocument();
  });

  it('submits full withdrawal after confirm', async () => {
    getWithdrawalFeePreview.mockResolvedValueOnce(defaultPreview);
    createInvestorRequest.mockResolvedValueOnce({ data: { id: 1 }, error: null });

    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );

    fireEvent.click(screen.getByLabelText('Total'));
    expect(screen.queryByLabelText(/Monto/)).not.toBeInTheDocument();

    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Confirmar retiro')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(createInvestorRequest).toHaveBeenCalled();
    });

    expect(await screen.findByText('Retiro solicitado')).toBeInTheDocument();
  });

  it('shows error when createInvestorRequest fails (after confirm)', async () => {
    getWithdrawalFeePreview.mockResolvedValueOnce(defaultPreview);
    createInvestorRequest.mockResolvedValueOnce({ data: null, error: 'Nope' });

    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );

    const amountInput = screen.getByLabelText(/Monto/);
    fireEvent.change(amountInput, { target: { value: '10' } });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Confirmar retiro')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByText('Nope')).toBeInTheDocument();
  });

  it('shows error when getWithdrawalFeePreview fails', async () => {
    getWithdrawalFeePreview.mockResolvedValueOnce({ data: null, error: 'Error de red' });

    const { container } = render(
      <WithdrawalForm userName="Test" userEmail="t@e.com" currentBalance={100} />,
    );

    const amountInput = screen.getByLabelText(/Monto/);
    fireEvent.change(amountInput, { target: { value: '10' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('Error de red')).toBeInTheDocument();
    expect(screen.queryByText('Confirmar retiro')).not.toBeInTheDocument();
  });
});
