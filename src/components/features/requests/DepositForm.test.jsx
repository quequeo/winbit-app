import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DepositForm } from './DepositForm';
import { createInvestorRequest } from '../../../services/api';
import { uploadImage } from '../../../utils/uploadImage';
import { i18n } from '../../../i18n';

vi.mock('../../../services/api', () => ({
  createInvestorRequest: vi.fn(),
}));

vi.mock('../../../utils/uploadImage', () => ({
  uploadImage: vi.fn(),
}));

const mockDepositOptions = [
  { id: '1', category: 'CASH_ARS', label: 'Efectivo', currency: 'ARS', details: {} },
  {
    id: '2',
    category: 'BANK_ARS',
    label: 'Galicia',
    currency: 'ARS',
    details: { bank_name: 'Galicia', holder: 'Winbit', cbu_cvu: '007' },
  },
  {
    id: '3',
    category: 'CRYPTO',
    label: 'USDT TRC20',
    currency: 'USDT',
    details: { address: 'TF7j', network: 'TRC20' },
  },
];

describe('DepositForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders English strings when language is en', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    render(<DepositForm userEmail="t@e.com" depositOptions={mockDepositOptions} />);

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
    const { container } = render(
      <DepositForm userEmail="t@e.com" depositOptions={mockDepositOptions} />,
    );
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ingresá un monto válido');
  });

  it('submits successfully', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    createInvestorRequest.mockResolvedValueOnce({ data: { id: 1 }, error: null });
    const { container } = render(
      <DepositForm userEmail="t@e.com" depositOptions={mockDepositOptions} />,
    );

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

    expect(await screen.findByText('Solicitud registrada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aceptar/i })).toBeInTheDocument();
  });

  it('shows service error', async () => {
    createInvestorRequest.mockResolvedValueOnce({ data: null, error: 'Fail' });
    const { container } = render(
      <DepositForm userEmail="t@e.com" depositOptions={mockDepositOptions} />,
    );

    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '10' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Fail');
  });

  it('uploads attachment to Firebase Storage and sends the https URL', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    uploadImage.mockResolvedValueOnce({
      url: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/receipt.jpg?alt=media&token=abc',
      error: null,
    });
    createInvestorRequest.mockResolvedValueOnce({ data: { id: 1 }, error: null });

    // Start with a non-cash method as first option so the file input is shown from the start
    const nonCashOptions = [
      { id: '2', category: 'BANK_ARS', label: 'Galicia', currency: 'ARS', details: {} },
    ];
    const { container } = render(
      <DepositForm userEmail="t@e.com" depositOptions={nonCashOptions} />,
    );

    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '500' } });

    const file = new File(['img'], 'receipt.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(uploadImage).toHaveBeenCalledWith(file, 'receipts');
      expect(createInvestorRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          attachmentUrl:
            'https://firebasestorage.googleapis.com/v0/b/bucket/o/receipt.jpg?alt=media&token=abc',
        }),
      );
    });
  });

  it('shows error when attachment upload fails', async () => {
    uploadImage.mockResolvedValueOnce({ url: null, error: 'Error al subir imagen' });

    const nonCashOptions = [
      { id: '2', category: 'BANK_ARS', label: 'Galicia', currency: 'ARS', details: {} },
    ];
    const { container } = render(
      <DepositForm userEmail="t@e.com" depositOptions={nonCashOptions} />,
    );

    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '500' } });

    const file = new File(['img'], 'receipt.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Error al subir imagen');
    expect(createInvestorRequest).not.toHaveBeenCalled();
  });

  it('derives method options from deposit options', () => {
    render(<DepositForm userEmail="t@e.com" depositOptions={mockDepositOptions} />);

    const selectButton = screen.getByLabelText(/Método/);
    expect(selectButton).toBeInTheDocument();
    expect(selectButton.textContent).toContain('Efectivo ARS');
  });

  it('falls back to hardcoded methods when no deposit options', () => {
    render(<DepositForm userEmail="t@e.com" depositOptions={[]} />);

    const selectButton = screen.getByLabelText(/Método/);
    expect(selectButton).toBeInTheDocument();
    expect(selectButton.textContent).toContain('Efectivo ARS');
  });
});
