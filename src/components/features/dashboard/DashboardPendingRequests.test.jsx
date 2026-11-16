import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardPendingRequests } from './DashboardPendingRequests';

vi.mock('../requests/PendingRequestActions', () => ({
  PendingRequestActions: ({ row }) => <div data-testid={`actions-${row.id}`} />,
}));

vi.mock('../requests/EnablePushPrompt', () => ({
  EnablePushPrompt: () => <div data-testid="enable-push-prompt" />,
}));

const rows = [
  {
    id: 'request_1',
    movement: 'WITHDRAWAL',
    amount: -300,
    status: 'PENDING',
    date: '2026-11-16T13:32:00Z',
  },
  { id: 'ph-1', movement: 'DEPOSIT', amount: 1000, status: 'COMPLETED', date: '2026-11-01' },
];

describe('DashboardPendingRequests', () => {
  it('muestra las solicitudes enviadas que siguen en revisión, con fecha y hora y sus acciones', () => {
    render(<DashboardPendingRequests history={rows} hidden={false} />);

    expect(screen.getByTestId('dashboard-pending-requests')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes en curso')).toBeInTheDocument();
    expect(screen.getByText('Solicitud de retiro')).toBeInTheDocument();
    expect(screen.getByText(/Enviada el 16 Nov 2026 - 10:32/)).toBeInTheDocument();
    expect(screen.getByTestId('actions-request_1')).toBeInTheDocument();
    expect(screen.getByTestId('enable-push-prompt')).toBeInTheDocument();
    expect(screen.queryByText('Solicitud de depósito')).not.toBeInTheDocument();
  });

  it('oculta el importe si el inversor ocultó los saldos', () => {
    render(<DashboardPendingRequests history={rows} hidden />);
    expect(screen.getByText('••••••')).toBeInTheDocument();
  });

  it('no muestra nada si no hay solicitudes pendientes', () => {
    const { container } = render(<DashboardPendingRequests history={[rows[1]]} hidden={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
