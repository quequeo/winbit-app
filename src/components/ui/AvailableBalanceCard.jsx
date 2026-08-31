import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  formatUsdAmountOnly,
  formatUsdDisplay,
  formatUsdSignedDisplay,
} from '../../utils/formatUsdDisplay';

export const AvailableBalanceCard = ({
  availableForWithdrawal,
  portfolioBalance,
  pendingWithdrawals = 0,
  pendingFees = 0,
  pendingAdjustments = 0,
  className = '',
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const mask = (value) => (visible ? formatUsdDisplay(value) : '••••••');
  const maskDeduction = (value) =>
    visible ? formatUsdSignedDisplay(-Math.abs(Number(value) || 0)) : '••••••';
  const showBreakdown = pendingWithdrawals > 0 || pendingFees > 0 || pendingAdjustments > 0;

  const renderMainBalance = () => {
    if (!visible) {
      return <span className="withdrawal-balance-card__masked">••••••</span>;
    }
    return (
      <>
        <span className="withdrawal-balance-card__currency">USD</span>{' '}
        <span className="withdrawal-balance-card__amount">
          {formatUsdAmountOnly(availableForWithdrawal)}
        </span>
      </>
    );
  };

  return (
    <div className={`winbit-card winbit-card--premium withdrawal-balance-card ${className}`}>
      <div className="withdrawal-balance-card__row">
        <div className="withdrawal-balance-card__icon" aria-hidden>
          <Wallet className="text-primary-soft" strokeWidth={1.5} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="withdrawal-balance-card__label">{t('withdrawals.availableBalance')}</p>
          <p className="withdrawal-balance-card__value">{renderMainBalance()}</p>
        </div>

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="withdrawal-balance-card__toggle"
          aria-label={visible ? t('dashboard.hideBalances') : t('dashboard.showBalances')}
        >
          {visible ? <EyeOff strokeWidth={1.75} /> : <Eye strokeWidth={1.75} />}
        </button>
      </div>

      {showBreakdown ? (
        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="withdrawal-breakdown-toggle"
          >
            {t('withdrawals.breakdown.toggle')}
            {expanded ? (
              <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>

          {expanded ? (
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">{t('withdrawals.breakdown.portfolio')}</dt>
                <dd className="text-text-primary tabular-nums font-medium">
                  {mask(portfolioBalance)}
                </dd>
              </div>
              {pendingFees > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{t('withdrawals.breakdown.pendingFees')}</dt>
                  <dd className="text-negative tabular-nums font-medium">
                    {maskDeduction(pendingFees)}
                  </dd>
                </div>
              ) : null}
              {pendingWithdrawals > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">
                    {t('withdrawals.breakdown.pendingWithdrawals')}
                  </dt>
                  <dd className="text-negative tabular-nums font-medium">
                    {maskDeduction(pendingWithdrawals)}
                  </dd>
                </div>
              ) : null}
              {pendingAdjustments > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">
                    {t('withdrawals.breakdown.pendingAdjustments')}
                  </dt>
                  <dd className="text-negative tabular-nums font-medium">
                    {maskDeduction(pendingAdjustments)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <dt className="font-semibold text-text-primary">
                  {t('withdrawals.breakdown.available')}
                </dt>
                <dd className="font-bold text-primary tabular-nums">
                  {mask(availableForWithdrawal)}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
