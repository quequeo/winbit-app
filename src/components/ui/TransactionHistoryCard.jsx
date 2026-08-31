import { Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { formatActivityBalanceUsd } from '../../utils/accountActivity';
import { PaymentMethodIconFromOption } from './PaymentMethodIcon';

const STATUS_BADGE = {
  COMPLETED: 'transaction-history-card__badge--completed',
  PENDING: 'transaction-history-card__badge--pending',
  REJECTED: 'transaction-history-card__badge--rejected',
};

const CIRCLED_BADGE_STATUSES = new Set(['COMPLETED', 'REJECTED']);

const formatBalanceImpact = (previousBalance, newBalance) => {
  const hasPrev =
    previousBalance !== null &&
    previousBalance !== undefined &&
    Number.isFinite(Number(previousBalance));
  const hasNext =
    newBalance !== null && newBalance !== undefined && Number.isFinite(Number(newBalance));
  if (!hasPrev || !hasNext) return '—';
  return `Saldo: ${formatActivityBalanceUsd(previousBalance)} → ${formatActivityBalanceUsd(newBalance)}`;
};

const normalizeBalanceImpact = (label) => {
  if (!label) return '—';
  const text = String(label).trim().toLowerCase();
  if (
    text.includes('sin impacto') ||
    text.includes('no balance impact') ||
    text.includes('not applied')
  ) {
    return '—';
  }
  return label;
};

export const TransactionHistoryCard = ({
  amount,
  conceptLabel,
  methodLabel,
  date,
  status,
  statusLabel,
  statusIcon: StatusIcon,
  methodOption,
  previousBalance,
  newBalance,
  balanceImpactLabel,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const statusKey = String(status ?? '').toUpperCase();
  const badgeCls = STATUS_BADGE[statusKey] ?? 'transaction-history-card__badge--pending';
  const balanceImpact = normalizeBalanceImpact(
    balanceImpactLabel ?? formatBalanceImpact(previousBalance, newBalance),
  );
  const title = conceptLabel || methodLabel;

  return (
    <article className="transaction-history-card">
      <div className="transaction-history-card__layout">
        <div className="transaction-history-card__logo" aria-hidden>
          <PaymentMethodIconFromOption
            option={methodOption ?? { label: methodLabel }}
            className="transaction-history-card__logo-icon"
          />
        </div>

        <div className="transaction-history-card__main">
          <p className="transaction-history-card__concept">{title}</p>
          <p className="transaction-history-card__method">{methodLabel}</p>
          <p className="transaction-history-card__date">
            <Calendar strokeWidth={1.75} aria-hidden />
            <span>{formatDate(date, { hourSuffix: true })}</span>
          </p>
          <p className="transaction-history-card__balance">{balanceImpact}</p>
          {secondaryActionLabel && onSecondaryAction ? (
            <button
              type="button"
              className="transaction-history-card__action"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </button>
          ) : null}
        </div>

        <div className="transaction-history-card__aside">
          <p className="transaction-history-card__amount">{formatCurrency(amount)}</p>
          <span className={`transaction-history-card__badge ${badgeCls}`}>
            {StatusIcon ? (
              <span
                className={
                  CIRCLED_BADGE_STATUSES.has(statusKey)
                    ? `transaction-history-card__badge-icon transaction-history-card__badge-icon--${statusKey.toLowerCase()}`
                    : 'transaction-history-card__badge-icon transaction-history-card__badge-icon--plain'
                }
                aria-hidden
              >
                <StatusIcon strokeWidth={2} />
              </span>
            ) : null}
            {statusLabel}
          </span>
        </div>
      </div>
    </article>
  );
};
