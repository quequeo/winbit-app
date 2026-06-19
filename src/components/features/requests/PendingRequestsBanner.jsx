import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useInvestorHistory } from '../../../hooks/useInvestorHistory';
import { getPendingRequests } from '../../../utils/requestHistory';
import { formatCurrency } from '../../../utils/formatCurrency';

const typeLabel = (type, t) =>
  type === 'WITHDRAWAL'
    ? t('requests.notifications.typeWithdrawal')
    : t('requests.notifications.typeDeposit');

export const PendingRequestsBanner = () => {
  const { userEmail } = useAuth();
  const { data: history, loading } = useInvestorHistory(userEmail);
  const { t } = useTranslation();

  const pending = getPendingRequests(Array.isArray(history) ? history : []);
  if (loading || pending.length === 0) return null;

  const count = pending.length;

  return (
    <div
      className="winbit-card border-[rgba(194,170,114,0.35)] !py-4"
      role="status"
      data-testid="pending-requests-banner"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3 min-w-0">
          <Clock
            className="w-5 h-5 shrink-0 text-warning mt-0.5"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-semibold text-text-primary">
              {t('requests.notifications.pendingBannerTitle', { count })}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {t('requests.notifications.pendingBannerSubtitle')}
            </p>
            <ul className="mt-3 space-y-2">
              {pending.slice(0, 3).map((row) => {
                const type = String(row.movement ?? '').toUpperCase();
                return (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-primary"
                  >
                    <span className="font-medium">{typeLabel(type, t)}</span>
                    <span className="text-text-muted">·</span>
                    <span>{formatCurrency(Number(row.amount))}</span>
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold bg-[#c2aa72]/10 text-[#c2aa72] border border-[#c2aa72]/20">
                      {t('history.status.pending')}
                    </span>
                  </li>
                );
              })}
            </ul>
            {count > 3 ? (
              <p className="text-xs text-text-muted mt-2">
                {t('requests.notifications.pendingBannerMore', { count: count - 3 })}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {pending.some((r) => String(r.movement).toUpperCase() === 'DEPOSIT') ? (
            <Link
              to="/wallets"
              state={{ tab: 'history' }}
              className="inline-flex items-center rounded-lg border border-[rgba(101,167,165,0.35)] bg-[rgba(101,167,165,0.12)] px-3 py-2 text-sm font-medium text-[#8dc8bf] hover:bg-[rgba(101,167,165,0.22)] transition-colors"
            >
              {t('requests.notifications.viewDeposits')}
            </Link>
          ) : null}
          {pending.some((r) => String(r.movement).toUpperCase() === 'WITHDRAWAL') ? (
            <Link
              to="/requests"
              state={{ tab: 'history' }}
              className="inline-flex items-center rounded-lg border border-[rgba(101,167,165,0.35)] bg-[rgba(101,167,165,0.12)] px-3 py-2 text-sm font-medium text-[#8dc8bf] hover:bg-[rgba(101,167,165,0.22)] transition-colors"
            >
              {t('requests.notifications.viewWithdrawals')}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};
