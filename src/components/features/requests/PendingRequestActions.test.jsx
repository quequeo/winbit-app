import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { PendingRequestActions } from './PendingRequestActions';
import { ToastProvider } from '../../ui/ToastProvider';
import { cancelInvestorRequest } from '../../../services/api';

vi.mock('../../../services/api', () => ({
  cancelInvestorRequest: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ userEmail: 'inversor@example.com' }),
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

const renderActions = (row) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const utils = render(
    <MemoryRouter
      initialEntries={['/history']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Routes>
            <Route path="*" element={<PendingRequestActions row={row} />} />
          </Routes>
          <LocationDisplay />
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
  return { ...utils, invalidateSpy };
};

const pendingWithdrawal = {
  id: 'request_8f3c2a10-uuid',
  movement: 'WITHDRAWAL',
  amount: -500,
  status: 'PENDING',
  date: '2026-11-03T12:00:00Z',
};

describe('PendingRequestActions', () => {
  beforeEach(() => {
    cancelInvestorRequest.mockReset();
  });

  it('renders nothing for rows that are not pending requests', () => {
    const { container } = render(
      <PendingRequestActions row={{ ...pendingWithdrawal, status: 'CANCELLED' }} />,
    );
    expect(container).toBeEmptyDOMElement();

    const { container: completed } = render(
      <PendingRequestActions row={{ id: 'ph-1', movement: 'DEPOSIT', status: 'PENDING' }} />,
    );
    expect(completed).toBeEmptyDOMElement();
  });

  it('asks for confirmation, cancels with the bare UUID, shows a toast and refreshes', async () => {
    cancelInvestorRequest.mockResolvedValue({
      data: { id: '8f3c2a10-uuid', status: 'CANCELLED' },
      error: null,
      status: 200,
    });
    const { invalidateSpy } = renderActions(pendingWithdrawal);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Cancelar solicitud' }));
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(
      '¿Cancelar la solicitud de retiro de USD 500,00? No se va a procesar.',
    );
    expect(cancelInvestorRequest).not.toHaveBeenCalled();

    await act(async () => {
      await userEvent.click(
        screen
          .getAllByRole('button', { name: 'Cancelar solicitud' })
          .find((b) => dialog.contains(b)),
      );
    });

    expect(cancelInvestorRequest).toHaveBeenCalledWith('inversor@example.com', '8f3c2a10-uuid');
    expect(await screen.findByText('Solicitud cancelada')).toBeInTheDocument();
    expect(
      screen.getByText('La solicitud de retiro de USD 500,00 fue cancelada.'),
    ).toBeInTheDocument();
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['investor'] }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does nothing when the investor goes back from the confirmation', async () => {
    renderActions(pendingWithdrawal);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Cancelar solicitud' }));
    });
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Volver' }));
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(cancelInvestorRequest).not.toHaveBeenCalled();
  });

  it('shows the already processed message on 422 and refreshes the row', async () => {
    cancelInvestorRequest.mockResolvedValue({
      data: null,
      error: 'La solicitud ya fue procesada y no se puede cancelar',
      status: 422,
    });
    const { invalidateSpy } = renderActions({
      ...pendingWithdrawal,
      movement: 'DEPOSIT',
      amount: 1000,
    });

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Cancelar solicitud' }));
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('¿Cancelar la solicitud de depósito de USD 1.000,00?');

    await act(async () => {
      await userEvent.click(
        screen
          .getAllByRole('button', { name: 'Cancelar solicitud' })
          .find((b) => dialog.contains(b)),
      );
    });

    expect(
      await screen.findByText('La solicitud ya fue procesada y no se puede cancelar.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Solicitud cancelada')).not.toBeInTheDocument();
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['investor'] }));
  });

  it('opens the withdrawal form to correct a withdrawal', async () => {
    renderActions(pendingWithdrawal);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Corregir' }));
    });

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/requests?correct=request_8f3c2a10-uuid',
    );
  });

  it('opens the deposit form to correct a deposit', async () => {
    renderActions({ ...pendingWithdrawal, movement: 'DEPOSIT' });

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Corregir' }));
    });

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/wallets?correct=request_8f3c2a10-uuid',
    );
  });
});
