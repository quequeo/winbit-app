import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestNotificationsProvider } from './RequestNotificationsProvider';

const showToast = vi.fn();
let historyData = [];

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ userEmail: 'Inversor@Example.com', isValidated: true }),
}));

vi.mock('../../../hooks/useInvestorHistory', () => ({
  useInvestorHistory: () => ({ data: historyData }),
}));

vi.mock('../../ui/ToastProvider', () => ({
  useToast: () => ({ showToast }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const SNAPSHOT_KEY = 'winbit-pending-requests:inversor@example.com';

const pendingDeposit = {
  id: 'request_abc',
  movement: 'DEPOSIT',
  amount: 500,
  status: 'PENDING',
  date: '2026-11-16T13:00:00Z',
};
const completedDeposit = {
  id: 'ph-10',
  movement: 'DEPOSIT',
  amount: 500,
  status: 'COMPLETED',
  date: '2026-11-16T21:00:00Z',
};

describe('RequestNotificationsProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    showToast.mockClear();
  });

  it('al abrir la app avisa una aprobación que pasó mientras estaba cerrada', () => {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify([pendingDeposit]));
    historyData = [completedDeposit];

    render(<RequestNotificationsProvider>contenido</RequestNotificationsProvider>);

    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        title: 'requests.notifications.depositApprovedTitle',
      }),
    );
    expect(JSON.parse(localStorage.getItem(SNAPSHOT_KEY))).toEqual([]);
  });

  it('la primera vez solo guarda las pendientes, sin avisar nada', () => {
    historyData = [pendingDeposit, completedDeposit];

    render(<RequestNotificationsProvider>contenido</RequestNotificationsProvider>);

    expect(showToast).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(SNAPSHOT_KEY))).toEqual([pendingDeposit]);
  });

  it('no repite el aviso si ya se mostró', () => {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify([pendingDeposit]));
    historyData = [completedDeposit];
    const first = render(<RequestNotificationsProvider>contenido</RequestNotificationsProvider>);
    first.unmount();

    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify([pendingDeposit]));
    render(<RequestNotificationsProvider>contenido</RequestNotificationsProvider>);

    expect(showToast).toHaveBeenCalledTimes(1);
  });
});
