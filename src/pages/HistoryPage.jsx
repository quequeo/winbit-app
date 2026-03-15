import { useAuth } from '../hooks/useAuth';
import { useInvestorHistory } from '../hooks/useInvestorHistory';
import { Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { formatPercentage } from '../utils/formatPercentage';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';

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

/** Formats YYYY-MM as "Ene 2026" (es) or "Jan 2026" (en). Returns label as-is if not YYYY-MM. */
const formatPeriodLabel = (label, t) => {
  if (!label || typeof label !== 'string') return label ?? '';
  const m = label.match(/^(\d{4})-(\d{2})$/);
  if (!m) return label;
  const year = parseInt(m[1], 10);
  const monthIndex = parseInt(m[2], 10) - 1; // 0..11
  const monthKey = `history.monthsShort.${monthIndex}`;
  const monthAbbrev = t(monthKey);
  return monthAbbrev && !monthAbbrev.includes('.') ? `${monthAbbrev} ${year}` : label;
};

const aggregateOperatingResultsByMonth = (rows) => {
  const otherRows = rows.filter((r) => normalize(r?.movement) !== 'operating_result');
  return [...otherRows];
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

  const translateMovement = (movement) => {
    const raw = String(movement ?? '').trim();
    const rawUpper = raw.toUpperCase();
    // Strip any weird/invisible characters (e.g. NBSP, zero-width) and keep only A-Z and underscores.
    const canonicalUpper = rawUpper.replace(/[^A-Z_]/g, '');

    // Hard guard: always translate this movement (including common typo with one "m").
    if (canonicalUpper === 'REFERRAL_COMMISSION' || canonicalUpper === 'REFERRAL_COMISSION') {
      return t('history.movement.referral_commission', 'Comisión por referido');
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
      return t('history.movement.operating_result', 'Resultado Operativo');
    }
    if (m === 'trading_fee' || m === 'comisión' || m === 'comision') {
      return t('history.movement.trading_fee', 'Comisión de Trading');
    }
    if (m === 'trading_fee_adjustment') {
      return t('history.movement.trading_fee_adjustment', 'Comisión de Trading - Ajuste');
    }
    if (m === 'deposit_reversal' || m === 'deposit_reversa' || m === 'depósito_revertido') {
      return t('history.movement.deposit_reversal', 'Depósito revertido');
    }
    // Accept multiple formats:
    // - REFERRAL_COMMISSION (backend enum)
    // - referral_commission
    // - referral commission / referral-commission
    const refKey = m.replace(/[\s-]+/g, '_');
    const looksLikeReferral =
      canonicalUpper === 'REFERRAL_COMMISSION' ||
      canonicalUpper === 'REFERRAL_COMISSION' || // common typo (one "m")
      rawUpper === 'REFERRAL COMMISSION' ||
      (rawUpper.includes('REFERRAL') && rawUpper.includes('COMMISSION'));

    if (
      looksLikeReferral ||
      refKey === 'referral_commission' ||
      refKey === 'referral_comission' ||
      refKey === 'comision_referido' ||
      refKey === 'comision_por_referido'
    ) {
      return t('history.movement.referral_commission', 'Comisión por referido');
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
      return 'bg-[rgba(239,83,80,0.15)] text-error';
    }
    if (s === 'pendiente' || s === 'pending') {
      return 'bg-[rgba(255,152,0,0.15)] text-warning';
    }
    return 'bg-primary text-white';
  };

  const movementKind = (movement) => {
    const m = normalize(movement);
    if (m === 'deposit' || m === 'deposito' || m === 'depósito') return 'deposit';
    if (m === 'retiro' || m === 'withdrawal' || m === 'deposit_reversal') return 'withdrawal';
    return null;
  };

  // DEPOSIT_REVERSAL stores positive amount; display as negative (outflow)
  const displayAmount = (row) => {
    const m = normalize(row?.movement);
    if (m === 'deposit_reversal') return -Math.abs(Number(row?.amount) || 0);
    return Number(row?.amount) || 0;
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
      return 'bg-[rgba(101,167,165,0.15)] hover:bg-[rgba(101,167,165,0.25)]';
    }

    if (m === 'operating_result') {
      const pct = Number(row?.operatingResultPercent);
      const sign = Number.isFinite(pct) ? pct : Number(row?.amount);
      if (sign > 0) return 'bg-[rgba(76,175,80,0.15)] hover:bg-[rgba(76,175,80,0.25)]';
      if (sign < 0) return 'bg-[rgba(239,83,80,0.15)] hover:bg-[rgba(239,83,80,0.25)]';
      return 'bg-dark-section hover:bg-accent-dim';
    }

    return 'hover:bg-accent-dim';
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
    const raw = Array.isArray(data) ? data : [];
    return aggregateOperatingResultsByMonth(raw);
  }, [data]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (translatedError) {
    return <ErrorMessage message={translatedError} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{t('history.title')}</h1>
        <p className="text-text-muted mt-1">{t('history.subtitle')}</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="📄"
          title={t('history.emptyTitle')}
          description={t('history.emptyDescription')}
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div data-testid="history-mobile" className="md:hidden space-y-3">
            {mobileVisibleRows.map((row, idx) => (
              <div
                key={`${row.code}-${row.date}-${idx}`}
                className="bg-dark-card rounded-lg border border-border-dark p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate">
                        {movementLabel(row)}
                      </div>
                      {movementCompletedIcon(row)}
                      {shouldShowStatusPill(row?.movement) && row?.status ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${statusPillClass(
                            row.status,
                          )}`}
                        >
                          {translateStatus(row.status, row?.movement)}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-text-muted mt-1">{formatDate(row.date)}</div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div
                      className={`text-base font-bold ${
                        displayAmount(row) > 0
                          ? 'text-success'
                          : displayAmount(row) < 0
                            ? 'text-error'
                            : 'text-text-primary'
                      }`}
                    >
                      {displayAmount(row) > 0 ? '+' : ''}
                      {formatCurrency(displayAmount(row))}
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[13px] text-text-muted flex items-center gap-2">
                  <span>Balance:</span>
                  <span className="font-medium text-text-primary">
                    {row.previousBalance !== null ? formatCurrency(row.previousBalance) : '-'}
                  </span>
                  <svg
                    className="w-3 h-3 text-text-dim"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                  <span className="font-medium text-text-primary">
                    {row.newBalance !== null ? formatCurrency(row.newBalance) : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {shouldPaginateMobile ? (
            <div className="md:hidden flex items-center justify-between gap-3">
              <div className="text-xs text-text-muted">
                {t('common.pageOf', 'Página {{page}} de {{total}}', {
                  page: mobilePage,
                  total: mobileTotalPages,
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border-dark text-text-primary hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
                  disabled={mobilePage <= 1}
                >
                  {t('common.previous', 'Anterior')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border-dark text-text-primary hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="hidden md:block overflow-hidden bg-dark-card rounded-lg border border-border-dark"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-dark">
                <thead className="bg-dark-section">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      {t('history.table.date')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      {t('history.table.movement')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      {t('history.table.amount')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      {t('history.table.previousBalance')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      {t('history.table.newBalance')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-dark-card divide-y divide-border-dark">
                  {desktopVisibleRows.map((row, idx) => (
                    <tr key={`${row.code}-${row.date}-${idx}`} className={desktopRowClass(row)}>
                      <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{movementLabel(row)}</span>
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
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary text-right whitespace-nowrap">
                        {formatCurrency(displayAmount(row))}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary text-right whitespace-nowrap">
                        {row.previousBalance !== null ? formatCurrency(row.previousBalance) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary text-right whitespace-nowrap">
                        {row.newBalance !== null ? formatCurrency(row.newBalance) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Desktop pagination */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-xs text-text-muted">
                {t('common.pageOf', 'Página {{page}} de {{total}}', {
                  page: desktopPage,
                  total: desktopTotalPages,
                })}
              </div>

              <label className="flex items-center gap-2 text-xs text-text-muted">
                {t('common.rowsPerPage', 'Filas por página')}
                <select
                  className="rounded-lg border border-border-dark bg-dark-card px-2 py-1 text-xs text-text-primary"
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
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border-dark text-text-primary hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setDesktopPage((p) => Math.max(1, p - 1))}
                  disabled={desktopPage <= 1}
                >
                  {t('common.previous', 'Anterior')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border-dark text-text-primary hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed"
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
