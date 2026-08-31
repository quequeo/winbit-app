import { useAuth } from '../hooks/useAuth';
import { useInvestorHistory } from '../hooks/useInvestorHistory';
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  LineChart,
  Percent,
  Users,
} from 'lucide-react';
import { HistoryListSkeleton } from '../components/ui/PageLoading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { formatPercentage } from '../utils/formatPercentage';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { ReceiptAttachment } from '../components/features/attachments/ReceiptAttachment';
import {
  ACCOUNT_ACTIVITY_FILTERS,
  formatActivityDateTime,
  formatActivityUsd,
  getActivityBalanceImpact,
  getActivityBriefDescription,
  getActivityCardTitle,
  getActivityDetailLine,
  getActivityFeePeriodLine,
  getActivitySecondaryAction,
  getMovementCategory,
  matchesActivityFilter,
} from '../utils/accountActivity';
import {
  formatOperatingResultDateTime,
  filterPublishedOperatingResults,
} from '../utils/operatingTrade';
import { AccountActivityCard } from '../components/features/history/AccountActivityCard';

const formatFeePercentage = (value) => {
  if (value === null || value === undefined) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  const fixed = n.toFixed(2).replace(/\.?0+$/, '');
  return `${fixed}%`;
};

const monthNamesEs = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const parseDateSafe = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

const formatMonthYearSlash = (dateStr) => {
  const d = parseDateSafe(dateStr);
  if (!d) return '';
  const mm = monthNamesEs[d.getUTCMonth()] || '';
  const yyyy = d.getUTCFullYear();
  return mm && yyyy ? `${mm}/${yyyy}` : '';
};

const formatMonthYearSpace = (dateStr) => {
  const d = parseDateSafe(dateStr);
  if (!d) return '';
  const mm = monthNamesEs[d.getUTCMonth()] || '';
  const yyyy = d.getUTCFullYear();
  return mm && yyyy ? `${mm} ${yyyy}` : '';
};

const formatPeriodLabel = (label, t) => {
  if (!label || typeof label !== 'string') return label ?? '';
  const m = label.match(/^(\d{4})-(\d{2})$/);
  if (!m) return label;
  const year = parseInt(m[1], 10);
  const monthIndex = parseInt(m[2], 10) - 1;
  const monthKey = `history.monthsShort.${monthIndex}`;
  const monthAbbrev = t(monthKey);
  return monthAbbrev && !monthAbbrev.includes('.') ? `${monthAbbrev} ${year}` : label;
};

const FILTER_ICONS = {
  all: Activity,
  capital_in: ArrowDownToLine,
  withdrawal: ArrowUpFromLine,
  operating: LineChart,
  trading_fee: Percent,
  referral: Users,
};

const amountToneClass = (amount) => {
  const num = Number(amount) || 0;
  if (num > 0) return 'text-positive';
  if (num < 0) return 'text-negative';
  return 'text-text-muted';
};

const formatSignedAmount = (amount) => formatActivityUsd(amount);

const formatRowDateTime = (row, t) => {
  if (getMovementCategory(row?.movement) === 'operating') {
    return formatOperatingResultDateTime(row.date, t);
  }
  return formatActivityDateTime(row.date, t);
};

export const HistoryPage = () => {
  const { t } = useTranslation();
  const { userEmail } = useAuth();
  const { data, loading, error, refetch } = useInvestorHistory(userEmail);

  const MOBILE_PAGE_SIZE = 20;
  const DESKTOP_PAGE_SIZE_OPTIONS = [10, 20, 50];
  const [desktopPageSize, setDesktopPageSize] = useState(20);
  const [mobilePage, setMobilePage] = useState(1);
  const [desktopPage, setDesktopPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');

  const categoryLabel = (movement) => {
    const category = getMovementCategory(movement);
    return t(`history.categories.${category}`, category);
  };

  const translateMovement = (movement) => {
    const raw = String(movement ?? '').trim();
    const rawUpper = raw.toUpperCase();
    const canonicalUpper = rawUpper.replace(/[^A-Z_]/g, '');

    if (canonicalUpper === 'REFERRAL_COMMISSION' || canonicalUpper === 'REFERRAL_COMISSION') {
      return t('history.movement.referral_commission', 'Bonificación por referido');
    }

    const m = normalize(raw);
    if (m === 'depósito' || m === 'deposito' || m === 'deposit' || m === 'deposito') {
      return t('history.movement.deposit');
    }
    if (m === 'retiro' || m === 'withdrawal') {
      return t('history.movement.withdrawal');
    }
    if (m === 'profit' || m === 'ganancia' || m === 'rendimiento') {
      return t('history.movement.profit', 'Rendimiento');
    }
    if (m === 'operating_result' || m === 'resultado_operativo' || m === 'resultado operativo') {
      return t('history.movement.operating_result', 'Resultado operativo diario');
    }
    if (m === 'trading_fee' || m === 'comisión' || m === 'comision') {
      return t('history.movement.trading_fee', 'Comisión de gestión');
    }
    if (m === 'trading_fee_adjustment') {
      return t('history.movement.trading_fee_adjustment', 'Ajuste administrativo');
    }
    if (m === 'deposit_reversal' || m === 'deposit_reversa' || m === 'depósito_revertido') {
      return t('history.movement.deposit_reversal', 'Ajuste administrativo');
    }
    const refKey = m.replace(/[\s-]+/g, '_');
    const looksLikeReferral =
      canonicalUpper === 'REFERRAL_COMMISSION' ||
      canonicalUpper === 'REFERRAL_COMISSION' ||
      rawUpper === 'REFERRAL COMMISSION' ||
      (rawUpper.includes('REFERRAL') && rawUpper.includes('COMMISSION'));

    if (
      looksLikeReferral ||
      refKey === 'referral_commission' ||
      refKey === 'referral_comission' ||
      refKey === 'comision_referido' ||
      refKey === 'comision_por_referido'
    ) {
      return t('history.movement.referral_commission', 'Bonificación por referido');
    }
    return raw;
  };

  const movementLabel = (row) => {
    const base = translateMovement(row?.movement);
    const m = normalize(row?.movement);

    if (m === 'profit') {
      const my = formatMonthYearSlash(row?.date);
      return my ? `${base} ${my}` : base;
    }

    if (m === 'operating_result') {
      const pct =
        row?.operatingResultPercent !== null && row?.operatingResultPercent !== undefined
          ? ` ${formatPercentage(Number(row.operatingResultPercent))}`
          : '';

      if (row?.operatingResultPartial) {
        return `${base}${pct} ${t('history.movement.toDate')}`;
      }
      const my = formatMonthYearSpace(row?.date);
      return my ? `${base}${pct} - ${my}` : `${base}${pct}`;
    }

    if (m === 'trading_fee') {
      if (row?.tradingFeeSource === 'WITHDRAWAL') {
        const feePct = formatFeePercentage(row?.tradingFeePercentage);
        const withdrawalAmount = Number(row?.tradingFeeWithdrawalAmount);
        const detail =
          Number.isFinite(withdrawalAmount) && withdrawalAmount > 0
            ? ` – ${t('history.movement.withdrawalAmountShort', 'Retiro {{amount}}', {
                amount: formatCurrency(withdrawalAmount),
              })}`
            : '';
        return `${base}${feePct ? ` (${feePct})` : ''}${detail}`;
      }

      const feePct = formatFeePercentage(row?.tradingFeePercentage);
      if (row?.tradingFeePeriodLabel) {
        const periodLabel = formatPeriodLabel(row.tradingFeePeriodLabel, t);
        return feePct ? `${base} ${feePct} - ${periodLabel}` : `${base} - ${periodLabel}`;
      }
      return feePct ? `${base} ${feePct}` : base;
    }

    if (m === 'trading_fee_adjustment') {
      const feePct = formatFeePercentage(row?.tradingFeePercentage);
      if (row?.tradingFeePeriodLabel) {
        const periodLabel = formatPeriodLabel(row.tradingFeePeriodLabel, t);
        return feePct ? `${base} ${feePct} - ${periodLabel}` : `${base} - ${periodLabel}`;
      }
      return feePct ? `${base} ${feePct}` : base;
    }

    return base;
  };

  const shouldShowStatusPill = (movement) => {
    const m = normalize(movement);
    return (
      m === 'deposit' ||
      m === 'deposito' ||
      m === 'depósito' ||
      m === 'retiro' ||
      m === 'withdrawal' ||
      m === 'deposit_reversal'
    );
  };

  const translateStatus = (status, movement) => {
    const s = normalize(status);
    if (s === 'completado' || s === 'completed') {
      const kind = movementKind(movement);
      if (kind === 'deposit') return t('history.status.depositCompleted');
      return t('history.status.completed');
    }
    if (s === 'pendiente' || s === 'pending') {
      return t('history.status.pending');
    }
    if (s === 'rechazado' || s === 'rejected') {
      return t('history.status.rejected');
    }
    if (s === 'cancelado' || s === 'cancelled' || s === 'canceled') {
      return t('history.status.cancelled');
    }
    return status;
  };

  const isCompletedStatus = (status) => {
    const s = normalize(status);
    return s === 'completado' || s === 'completed';
  };

  const statusPillClass = (status) => {
    const s = normalize(status);
    if (s === 'rechazado' || s === 'rejected') {
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    }
    if (s === 'pendiente' || s === 'pending') {
      return 'bg-[#c2aa72]/10 text-[#c2aa72] border border-[#c2aa72]/20';
    }
    return 'bg-[#8dc8bf]/10 text-[#8dc8bf] border border-[#8dc8bf]/20';
  };

  const movementKind = (movement) => {
    const m = normalize(movement);
    if (m === 'deposit' || m === 'deposito' || m === 'depósito') return 'deposit';
    if (m === 'retiro' || m === 'withdrawal' || m === 'deposit_reversal') return 'withdrawal';
    return null;
  };

  const isDepositMovement = (movement) => movementKind(movement) === 'deposit';

  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);

  const DepositReceiptAction = ({ row }) => {
    if (!row?.attachmentUrl || !isDepositMovement(row?.movement)) return null;
    return (
      <button
        type="button"
        onClick={() => setReceiptPreviewUrl(row.attachmentUrl)}
        className="mt-2 text-xs font-semibold text-primary hover:underline"
      >
        {t('history.viewReceipt', 'Ver comprobante')}
      </button>
    );
  };

  const displayAmount = (row) => {
    const m = normalize(row?.movement);
    const raw = Number(row?.amount) || 0;

    if (m === 'deposit_reversal') return -Math.abs(raw);
    if (m === 'retiro' || m === 'withdrawal') return -Math.abs(raw);
    if (m === 'depósito' || m === 'deposito' || m === 'deposit') return Math.abs(raw);

    return raw;
  };

  const movementCompletedIcon = (row) => {
    if (!row) return null;
    if (!isCompletedStatus(row.status)) return null;

    const kind = movementKind(row.movement);
    if (kind === 'deposit') {
      return (
        <span
          data-testid="icon-deposit-completed"
          className="inline-flex"
          aria-hidden="true"
          title="Depósito completado"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-primary">
            <path
              fillRule="evenodd"
              d="M10 2a.75.75 0 01.75.75v8.69l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.22 2.22V2.75A.75.75 0 0110 2z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      );
    }

    if (kind === 'withdrawal') {
      return (
        <span
          data-testid="icon-withdrawal-completed"
          className="inline-flex"
          aria-hidden="true"
          title="Retiro completado"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-primary">
            <path
              fillRule="evenodd"
              d="M10 18a.75.75 0 01-.75-.75v-8.69l-2.22 2.22a.75.75 0 11-1.06-1.06l3.5-3.5a.75.75 0 011.06 0l3.5 3.5a.75.75 0 11-1.06 1.06l-2.22-2.22v8.69A.75.75 0 0110 18z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      );
    }

    return null;
  };

  const desktopRowClass = (row) => {
    const m = normalize(row?.movement);

    if (m === 'trading_fee' || m === 'trading_fee_adjustment') {
      return 'row-fee';
    }

    if (m === 'operating_result') {
      const pct = Number(row?.operatingResultPercent);
      const sign = Number.isFinite(pct) ? pct : Number(row?.amount);
      if (sign > 0) return 'row-positive';
      if (sign < 0) return 'row-negative';
      return 'hover:bg-[rgba(57, 131, 109,0.08)]';
    }

    return 'hover:bg-[rgba(57, 131, 109,0.08)]';
  };

  const translatedError = (() => {
    if (!error) {
      return null;
    }
    if (error === 'Google Sheets credentials not configured') {
      return t('sheets.credentialsNotConfigured');
    }
    if (error === 'Investor email mapping not configured') {
      return t('history.errors.emailMappingNotConfigured');
    }
    return error;
  })();

  const rows = useMemo(() => {
    const raw = filterPublishedOperatingResults(Array.isArray(data) ? data : []);
    return raw.filter((row) => matchesActivityFilter(row?.movement, activeFilter));
  }, [data, activeFilter]);

  useEffect(() => {
    setMobilePage(1);
    setDesktopPage(1);
  }, [activeFilter]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aT = a?.date ? new Date(a.date).getTime() : 0;
      const bT = b?.date ? new Date(b.date).getTime() : 0;
      return bT - aT;
    });
  }, [rows]);

  const mobileTotalPages = useMemo(() => {
    const n = Math.ceil(sortedRows.length / MOBILE_PAGE_SIZE);
    return n > 0 ? n : 1;
  }, [sortedRows.length]);

  const desktopTotalPages = useMemo(() => {
    const n = Math.ceil(sortedRows.length / desktopPageSize);
    return n > 0 ? n : 1;
  }, [sortedRows.length, desktopPageSize]);

  useEffect(() => {
    setMobilePage((p) => Math.min(Math.max(1, p), mobileTotalPages));
  }, [mobileTotalPages]);

  useEffect(() => {
    setDesktopPage((p) => Math.min(Math.max(1, p), desktopTotalPages));
  }, [desktopTotalPages]);

  const mobileVisibleRows = useMemo(() => {
    const start = (mobilePage - 1) * MOBILE_PAGE_SIZE;
    return sortedRows.slice(start, start + MOBILE_PAGE_SIZE);
  }, [sortedRows, mobilePage]);

  const desktopVisibleRows = useMemo(() => {
    const start = (desktopPage - 1) * desktopPageSize;
    return sortedRows.slice(start, start + desktopPageSize);
  }, [sortedRows, desktopPage, desktopPageSize]);

  const shouldPaginateMobile = sortedRows.length > MOBILE_PAGE_SIZE;
  const shouldPaginateDesktop = sortedRows.length > desktopPageSize;

  const hasAnyRows = Array.isArray(data) && data.length > 0;
  const isFilterEmpty = hasAnyRows && rows.length === 0;

  const pageHeader = (
    <header className="page-header account-activity__header">
      <h1 className="page-title">{t('history.title')}</h1>
      <p className="section-subtitle">{t('history.subtitle')}</p>
    </header>
  );

  const filterBar =
    hasAnyRows && !loading ? (
      <div className="account-activity__filters" role="tablist" aria-label={t('history.title')}>
        {ACCOUNT_ACTIVITY_FILTERS.map((filterKey) => {
          const Icon = FILTER_ICONS[filterKey] ?? Activity;
          const isActive = activeFilter === filterKey;
          return (
            <button
              key={filterKey}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`account-activity-filter${isActive ? ' account-activity-filter--active' : ''}`}
              onClick={() => setActiveFilter(filterKey)}
            >
              <Icon className="account-activity-filter__icon" aria-hidden />
              {t(`history.categories.${filterKey}`)}
            </button>
          );
        })}
      </div>
    ) : null;

  if (loading) {
    return (
      <div className="account-activity">
        {pageHeader}
        <HistoryListSkeleton rows={5} />
      </div>
    );
  }

  if (translatedError) {
    return <ErrorMessage message={translatedError} onRetry={refetch} />;
  }

  return (
    <div className="account-activity">
      {receiptPreviewUrl ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setReceiptPreviewUrl(null)}
            aria-hidden
          />
          <div className="winbit-overlay-panel">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-text-primary">
                {t('history.viewReceipt', 'Ver comprobante')}
              </h2>
              <button
                type="button"
                onClick={() => setReceiptPreviewUrl(null)}
                className="text-sm font-semibold text-text-muted hover:text-text-primary"
              >
                {t('common.close', 'Cerrar')}
              </button>
            </div>
            <ReceiptAttachment url={receiptPreviewUrl} />
          </div>
        </div>
      ) : null}

      {pageHeader}
      {filterBar}

      {!hasAnyRows ? (
        <EmptyState
          icon={Activity}
          title={t('history.emptyTitle')}
          description={t('history.emptyDescription')}
        />
      ) : isFilterEmpty ? (
        <EmptyState
          icon={Activity}
          title={t('history.filterEmpty')}
          description={t('history.emptyDescription')}
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div data-testid="history-mobile" className="md:hidden account-activity__list">
            {mobileVisibleRows.map((row, idx) => {
              const amount = displayAmount(row);
              const secondaryAction = getActivitySecondaryAction(row, t);

              return (
                <AccountActivityCard
                  key={`${row.code}-${row.date}-${idx}`}
                  title={getActivityCardTitle(row, t)}
                  dateTime={formatRowDateTime(row, t)}
                  description={getActivityBriefDescription(row, t)}
                  detailLine={getActivityDetailLine(row, t)}
                  detailSecondaryLine={getActivityFeePeriodLine(row, t)}
                  balanceImpact={getActivityBalanceImpact(row, t)}
                  amount={formatSignedAmount(amount)}
                  amountTone={amountToneClass(amount)}
                  secondaryAction={secondaryAction}
                  onSecondaryAction={
                    secondaryAction?.type === 'button'
                      ? () => setReceiptPreviewUrl(row.attachmentUrl)
                      : undefined
                  }
                />
              );
            })}
          </div>

          {shouldPaginateMobile ? (
            <div className="md:hidden flex items-center justify-between gap-3">
              <div className="text-xs text-text-primary">
                {t('common.pageOf', 'Página {{page}} de {{total}}', {
                  page: mobilePage,
                  total: mobileTotalPages,
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,255,255,0.08)] text-text-primary hover:bg-[rgba(57, 131, 109,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
                  disabled={mobilePage <= 1}
                >
                  {t('common.previous', 'Anterior')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,255,255,0.08)] text-text-primary hover:bg-[rgba(57, 131, 109,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setMobilePage((p) => Math.min(mobileTotalPages, p + 1))}
                  disabled={mobilePage >= mobileTotalPages}
                >
                  {t('common.next', 'Siguiente')}
                </button>
              </div>
            </div>
          ) : null}

          {/* Desktop table */}
          <div
            data-testid="history-desktop"
            className="hidden md:block winbit-card account-activity-table-wrap !p-0"
          >
            <div className="overflow-x-auto">
              <table className="account-activity-table">
                <thead>
                  <tr>
                    <th scope="col">{t('history.table.date')}</th>
                    <th scope="col">{t('history.table.category')}</th>
                    <th scope="col">{t('history.table.movement')}</th>
                    <th scope="col">{t('history.table.amount')}</th>
                    <th scope="col">{t('history.table.previousBalance')}</th>
                    <th scope="col">{t('history.table.newBalance')}</th>
                  </tr>
                </thead>
                <tbody>
                  {desktopVisibleRows.map((row, idx) => {
                    const category = getMovementCategory(row?.movement);
                    const amount = displayAmount(row);

                    return (
                      <tr key={`${row.code}-${row.date}-${idx}`} className={desktopRowClass(row)}>
                        <td className="whitespace-nowrap text-text-muted">
                          {getMovementCategory(row?.movement) === 'operating'
                            ? formatOperatingResultDateTime(row.date, t)
                            : formatDate(row.date)}
                        </td>
                        <td>
                          <span
                            className={`account-activity-category account-activity-category--${category}`}
                          >
                            {categoryLabel(row?.movement)}
                          </span>
                        </td>
                        <td className="account-activity-table__movement-cell">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="account-activity-table__movement-label">
                              {movementLabel(row)}
                            </span>
                            {movementCompletedIcon(row)}
                            {shouldShowStatusPill(row?.movement) && row?.status ? (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusPillClass(
                                  row.status,
                                )}`}
                              >
                                {translateStatus(row.status, row?.movement)}
                              </span>
                            ) : null}
                          </div>
                          <DepositReceiptAction row={row} />
                        </td>
                        <td
                          className={`whitespace-nowrap font-semibold ${amountToneClass(amount)}`}
                        >
                          {formatSignedAmount(amount)}
                        </td>
                        <td className="whitespace-nowrap text-text-muted">
                          {row.previousBalance !== null ? formatCurrency(row.previousBalance) : '-'}
                        </td>
                        <td className="whitespace-nowrap">
                          {row.newBalance !== null ? formatCurrency(row.newBalance) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Desktop pagination */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-xs text-text-primary">
                {t('common.pageOf', 'Página {{page}} de {{total}}', {
                  page: desktopPage,
                  total: desktopTotalPages,
                })}
              </div>

              <label className="flex items-center gap-2 text-xs text-text-muted">
                {t('common.rowsPerPage', 'Filas por página')}
                <select
                  className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(15,18,18,0.8)] px-2 py-1 text-xs text-text-primary"
                  value={desktopPageSize}
                  onChange={(e) => setDesktopPageSize(Number(e.target.value))}
                >
                  {DESKTOP_PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {shouldPaginateDesktop ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,255,255,0.08)] text-text-primary hover:bg-[rgba(57, 131, 109,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setDesktopPage((p) => Math.max(1, p - 1))}
                  disabled={desktopPage <= 1}
                >
                  {t('common.previous', 'Anterior')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,255,255,0.08)] text-text-primary hover:bg-[rgba(57, 131, 109,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setDesktopPage((p) => Math.min(desktopTotalPages, p + 1))}
                  disabled={desktopPage >= desktopTotalPages}
                >
                  {t('common.next', 'Siguiente')}
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
