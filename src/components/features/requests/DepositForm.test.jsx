import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DepositForm } from './DepositForm';
import { createInvestorRequest } from '../../../services/api';
import { uploadImage } from '../../../utils/uploadImage';
import { i18n } from '../../../i18n';

const renderWithQuery = (ui) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

vi.mock('../../../services/api', () => ({
  createInvestorRequest: vi.fn(),
}));

vi.mock('../../../utils/uploadImage', () => ({
  uploadImage: vi.fn(),
}));

const mockDepositOptions = [
  { id: '1', category: 'CASH_USD', label: 'Efectivo USD', currency: 'USD', details: {} },
  {
    id: '2',
    category: 'SWIFT',
    label: 'Transferencia internacional',
    currency: 'USD',
    details: { bank_name: 'JP Morgan', holder: 'Winbit', swift: 'JPMC' },
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
    renderWithQuery(<DepositForm userEmail="t@e.com" depositOptions={mockDepositOptions} />);

    expect(screen.getByText('Register deposit')).toBeInTheDocument();

    const amountInput = screen.getByLabelText(/Amount/);
    expect(amountInput).toHaveAttribute('placeholder', '1,000.00');
    expect(screen.getByRole('button', { name: 'Register deposit' })).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage('es');
    });
  });

  it('validates amount', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    const { container } = renderWithQuery(
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
    const { container } = renderWithQuery(
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
          method: 'CASH_USD',
          network: null,
          transactionHash: null,
          attachmentUrl: null,
        }),
      );
    });

    expect(await screen.findByText('Depósito informado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aceptar/i })).toBeInTheDocument();
  });

  it('shows service error', async () => {
    createInvestorRequest.mockResolvedValueOnce({ data: null, error: 'Fail' });
    const { container } = renderWithQuery(
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

    const nonCashOptions = [
      {
        id: '2',
        category: 'SWIFT',
        label: 'Transferencia internacional',
        currency: 'USD',
        details: {},
      },
    ];
    const { container } = renderWithQuery(
      <DepositForm userEmail="t@e.com" depositOptions={nonCashOptions} />,
    );

    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '500' } });

    const file = new File(['img'], 'receipt.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(uploadImage).toHaveBeenCalledWith(file, 'deposits');
      expect(createInvestorRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          attachmentUrl:
            'https://firebasestorage.googleapis.com/v0/b/bucket/o/receipt.jpg?alt=media&token=abc',
        }),
      );
    });
  });

  it('shows error when file exceeds 5MB', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    const nonCashOptions = [
      {
        id: '2',
        category: 'SWIFT',
        label: 'Transferencia internacional',
        currency: 'USD',
        details: {},
      },
    ];
    const { container } = renderWithQuery(
      <DepositForm userEmail="t@e.com" depositOptions={nonCashOptions} />,
    );

    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(await screen.findByRole('alert')).toHaveTextContent(/demasiado grande|5 MB/i);
  });

  it('validates attachment required for non-cash methods', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    const nonCashOptions = [
      {
        id: '2',
        category: 'SWIFT',
        label: 'Transferencia internacional',
        currency: 'USD',
        details: {},
      },
    ];
    const { container } = renderWithQuery(
      <DepositForm userEmail="t@e.com" depositOptions={nonCashOptions} />,
    );

    fireEvent.change(screen.getByLabelText(/Monto/), { target: { value: '500' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByRole('alert')).toHaveTextContent(/comprobante es obligatorio/i);
  });

  it('shows error when attachment upload fails', async () => {
    uploadImage.mockResolvedValueOnce({ url: null, error: 'Error al subir imagen' });

    const nonCashOptions = [
      {
        id: '2',
        category: 'SWIFT',
        label: 'Transferencia internacional',
        currency: 'USD',
        details: {},
      },
    ];
    const { container } = renderWithQuery(
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
    renderWithQuery(<DepositForm userEmail="t@e.com" depositOptions={mockDepositOptions} />);

    const selectButton = screen.getByLabelText(/Método/);
    expect(selectButton).toBeInTheDocument();
    expect(selectButton.textContent).toContain('Efectivo USD');
  });

  it('falls back to hardcoded methods when no deposit options', () => {
    renderWithQuery(<DepositForm userEmail="t@e.com" depositOptions={[]} />);

    const selectButton = screen.getByLabelText(/Método/);
    expect(selectButton).toBeInTheDocument();
    expect(selectButton.textContent).toContain('Efectivo USD');
  });
});
