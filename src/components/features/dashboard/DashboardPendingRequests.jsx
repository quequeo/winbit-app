import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getPendingRequests, isManageablePendingRequest } from '../../../utils/requestHistory';
import { getDashboardMovementStatus } from '../../../utils/dashboardMovementStatus';
import { StatusBadge } from '../../ui/StatusBadge';
import { PendingRequestActions } from '../requests/PendingRequestActions';

/**
 * Solicitudes de depósito o retiro que el inversor ya envió y Winbit todavía no
 * procesó. Va arriba de todo en el inicio para que, después de pedir, quede
 * claro que la solicitud se recibió (con fecha y hora) y se pueda cancelar o
 * corregir. No se muestra si no hay ninguna.
 */
export const DashboardPendingRequests = ({ history, hidden }) => {
  const { t } = useTranslation();
  const pending = getPendingRequests(Array.isArray(history) ? history : []).filter(
    isManageablePendingRequest,
  );

  if (pending.length === 0) return null;

  return (
    <div className="winbit-card dashboard-panel-card" data-testid="dashboard-pending-requests">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-primary" strokeWidth={1.5} aria-hidden />
        <h2 className="dashboard-section-title">{t('dashboard.pendingRequests.title')}</h2>
      </div>
      <p className="text-xs text-text-muted mb-2">{t('dashboard.pendingRequests.subtitle')}</p>

      {pending.map((row) => {
        const isDeposit = String(row.movement).toUpperCase() === 'DEPOSIT';
        const status = getDashboardMovementStatus(row, t);
        return (
          <div key={row.id} className="dashboard-list-item">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">
                  {t(
                    isDeposit
                      ? 'dashboard.pendingRequests.deposit'
                      : 'dashboard.pendingRequests.withdrawal',
                  )}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {t('dashboard.pendingRequests.requestedAt', { date: formatDate(row.date) })}
                </p>
              </div>
              <div className="text-right shrink-0 pl-2">
                <p className="text-sm font-bold tabular-nums text-text-primary">
                  {hidden ? '••••••' : formatCurrency(Math.abs(Number(row.amount) || 0))}
                </p>
                <div className="mt-1.5 flex justify-end">
                  <StatusBadge label={status.label} variant={status.variant} />
                </div>
              </div>
            </div>
            <PendingRequestActions row={row} />
          </div>
        );
      })}
    </div>
  );
};
