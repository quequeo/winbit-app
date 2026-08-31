import { ArrowLeftRight, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../utils/formatDate';
import { formatUsdSignedDisplay } from '../../../utils/formatUsdDisplay';
import { StatusBadge } from '../../ui/StatusBadge';
import { EmptyState } from '../../ui/EmptyState';
import { getDashboardMovementStatus } from '../../../utils/dashboardMovementStatus';

const CapitalInIcon = () => (
  <div className="dashboard-movement-icon" aria-hidden>
    <Wallet className="dashboard-movement-icon__svg" strokeWidth={1.5} />
  </div>
);

const isCapitalInMovement = (row) => {
  const key = String(row?.descriptionKey || '').toLowerCase();
  return key.includes('deposit') || key.includes('capital');
};

const MovementListItem = ({ row, hidden, t }) => {
  const amount = Number(row.amount) || 0;
  const isPositive = amount > 0;
  const isNegative = amount < 0;
  const amountClass = isPositive
    ? 'text-positive'
    : isNegative
      ? 'text-negative'
      : 'text-text-muted';
  const status = getDashboardMovementStatus(row, t);
  const showCapitalIcon = isCapitalInMovement(row);

  return (
    <div className="dashboard-list-item">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {showCapitalIcon ? <CapitalInIcon /> : null}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">{t(row.descriptionKey)}</p>
            <p className="text-xs text-text-muted mt-0.5">
              {formatDate(row.date, { time: false })}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0 pl-2">
          <p className={`text-sm font-bold tabular-nums ${amountClass}`}>
            {hidden ? '••••••' : formatUsdSignedDisplay(amount)}
          </p>
          <div className="mt-1.5 flex justify-end">
            <StatusBadge label={status.label} variant={status.variant} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardMovementsTable = ({ movements, hidden }) => {
  const { t } = useTranslation();

  return (
    <div className="winbit-card dashboard-panel-card">
      <div className="flex items-center justify-between mb-1">
        <h2 className="dashboard-section-title">{t('dashboard.recentMovements.title')}</h2>
        <Link to="/history" className="text-xs font-semibold text-primary hover:underline">
          {t('dashboard.viewAll')}
        </Link>
      </div>

      {!movements?.length ? (
        <EmptyState
          icon={ArrowLeftRight}
          title={t('dashboard.recentMovements.emptyTitle')}
          description={t('dashboard.recentMovements.emptyDescription')}
          className="dashboard-panel-empty"
        />
      ) : (
        <>
          <div className="md:hidden mt-3">
            {movements.map((row) => (
              <MovementListItem key={row.id} row={row} hidden={hidden} t={t} />
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto mt-4">
            <table className="dashboard-table w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th className="pb-2 pr-3 font-medium">{t('dashboard.recentMovements.date')}</th>
                  <th className="pb-2 pr-3 font-medium">
                    {t('dashboard.recentMovements.description')}
                  </th>
                  <th className="pb-2 pr-3 font-medium">{t('dashboard.recentMovements.status')}</th>
                  <th className="pb-2 font-medium text-right pr-2">
                    {t('dashboard.recentMovements.amount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {movements.map((row) => {
                  const amount = Number(row.amount) || 0;
                  const isPositive = amount > 0;
                  const isNegative = amount < 0;
                  const status = getDashboardMovementStatus(row, t);

                  return (
                    <tr key={row.id} className="border-t border-[rgba(255,255,255,0.06)]">
                      <td className="py-3 pr-3 text-text-muted whitespace-nowrap">
                        {formatDate(row.date, { time: false })}
                      </td>
                      <td className="py-3 pr-3 text-text-primary font-medium">
                        <span className="inline-flex items-center gap-2">
                          {isCapitalInMovement(row) ? (
                            <span
                              className="dashboard-movement-icon dashboard-movement-icon--inline"
                              aria-hidden
                            >
                              <Wallet className="dashboard-movement-icon__svg" strokeWidth={1.5} />
                            </span>
                          ) : null}
                          {t(row.descriptionKey)}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <StatusBadge label={status.label} variant={status.variant} />
                      </td>
                      <td
                        className={`py-3 pr-2 text-right font-bold tabular-nums whitespace-nowrap ${
                          isPositive
                            ? 'text-positive'
                            : isNegative
                              ? 'text-negative'
                              : 'text-text-muted'
                        }`}
                      >
                        {hidden ? '••••••' : formatUsdSignedDisplay(amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
