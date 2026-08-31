import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatUsdDisplay } from '../../utils/formatUsdDisplay';
import { formatDate } from '../../utils/formatDate';

export const AccountSummaryCard = ({
  availableBalance,
  pendingAmount,
  totalBalance,
  lastUpdated,
}) => {
  const { t } = useTranslation();

  return (
    <aside className="winbit-card winbit-card--highlight lg:sticky lg:top-24">
      <h3 className="text-base font-semibold text-text-primary mb-5">
        {t('deposits.summary.title')}
      </h3>

      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <span>{t('deposits.summary.available')}</span>
            <Info className="w-3 h-3 opacity-60" aria-hidden />
          </div>
          <p className="primary-value text-2xl">{formatUsdDisplay(availableBalance ?? 0)}</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <span>{t('deposits.summary.inReview')}</span>
            <Info className="w-3 h-3 opacity-60" aria-hidden />
          </div>
          <p className="text-xl font-semibold text-warning">
            {formatUsdDisplay(pendingAmount ?? 0)}
          </p>
        </div>

        <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <span>{t('deposits.summary.total')}</span>
            <Info className="w-3 h-3 opacity-60" aria-hidden />
          </div>
          <p className="text-xl font-semibold text-success">
            {formatUsdDisplay(totalBalance ?? availableBalance ?? 0)}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-1 text-xs text-text-muted">
        <p>{t('deposits.summary.baseCurrency')}</p>
        {lastUpdated ? (
          <p className="text-xs text-text-muted">
            {t('deposits.summary.lastUpdate')}: {formatDate(lastUpdated, { hourSuffix: true })}
          </p>
        ) : null}
      </div>
    </aside>
  );
};
