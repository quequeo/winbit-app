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
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
  return `${formatted}%`;
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

const monthKeyUtc = (dateStr) => {
  const d = parseDateSafe(dateStr);
  if (!d) return null;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
};

const endOfMonthIsoUtc = (ym) => {
  // ym: YYYY-MM
  const m = String(ym || '').match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const yyyy = parseInt(m[1], 10);
  const month = parseInt(m[2], 10); // 1..12
  const end = new Date(Date.UTC(yyyy, month, 0));
  const dd = String(end.getUTCDate()).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
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

const aggregateOperatingResultsByMonth = (rows) => {
  const now = new Date();
  const currentMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const opRows = [];
  const otherRows = [];

  rows.forEach((r) => {
    const m = normalize(r?.movement);
    if (m === 'operating_result') opRows.push(r);
    else otherRows.push(r);
  });

  const groups = new Map();

  opRows.forEach((r) => {
    const key = monthKeyUtc(r?.date);
    if (!key) {
      otherRows.push(r);
      return;
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(r);
  });

  const aggregated = Array.from(groups.entries()).map(([ym, rs]) => {
    const sortedAsc = [...rs].sort((a, b) => {
      const aT = a?.date ? new Date(a.date).getTime() : 0;
      const bT = b?.date ? new Date(b.date).getTime() : 0;
      return aT - bT;
    });

    const first = sortedAsc[0];
    const last = sortedAsc[sortedAsc.length - 1];

    const sumAmount = sortedAsc.reduce((acc, it) => acc + (Number(it?.amount) || 0), 0);

    const compoundedPercent = (() => {
      let factor = 1;
      sortedAsc.forEach((it) => {
        const prev = Number(it?.previousBalance);
        const amt = Number(it?.amount);
        if (!Number.isFinite(prev) || prev <= 0) return;
        if (!Number.isFinite(amt)) return;
        const pct = (amt / prev) * 100;
        factor *= 1 + pct / 100;
      });
      return (factor - 1) * 100;
    })();

    const operatingResultPercent = Number.isFinite(compoundedPercent)
      ? Math.round(compoundedPercent * 100) / 100
      : null;

    const isCurrentMonth = ym === currentMonthKey;
    const date = isCurrentMonth ? last?.date : endOfMonthIsoUtc(ym) || last?.date;

    return {
      id: `operating_result_${ym}`,
      code: first?.code ?? '',
      date,
      movement: 'OPERATING_RESULT',
      amount: sumAmount,
      previousBalance: first?.previousBalance ?? null,
      newBalance: last?.newBalance ?? null,
      status: last?.status ?? 'COMPLETED',
      operatingResultPartial: isCurrentMonth,
      operatingResultPercent,
    };
  });

  return [...otherRows, ...aggregated];
};

export const HistoryPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useInvestorHistory(user?.email);

  const MOBILE_PAGE_SIZE = 20;
  const DESKTOP_PAGE_SIZE_OPTIONS = [10, 20, 50];
  const [desktopPageSize, setDesktopPageSize] = useState(20);
  const [mobilePage, setMobilePage] = useState(1);
  const [desktopPage, setDesktopPage] = useState(1);

  const translateMovement = (movement) => {
    const m = normalize(movement);
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
    return movement;
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

    if (m === 'trading_fee' && row?.tradingFeePeriodLabel) {
      const feePct = formatFeePercentage(row?.tradingFeePercentage);
      return feePct
        ? `${base} ${feePct} - ${row.tradingFeePeriodLabel}`
        : `${base} - ${row.tradingFeePeriodLabel}`;
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
      m === 'withdrawal'
    );
  };

  const translateStatus = (status) => {
    const s = normalize(status);
    if (s === 'completado' || s === 'completed') {
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
      return 'bg-red-100 text-red-800';
    }
    return 'bg-primary text-white';
  };

  const movementKind = (movement) => {
    const m = normalize(movement);
    if (m === 'deposit' || m === 'deposito' || m === 'depósito') return 'deposit';
    if (m === 'retiro' || m === 'withdrawal') return 'withdrawal';
    return null;
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

    if (m === 'trading_fee') {
      return 'bg-blue-50 hover:bg-blue-100';
    }

    if (m === 'operating_result') {
      const pct = Number(row?.operatingResultPercent);
      const sign = Number.isFinite(pct) ? pct : Number(row?.amount);
      if (sign > 0) return 'bg-green-50 hover:bg-green-100';
      if (sign < 0) return 'bg-red-50 hover:bg-red-100';
      return 'bg-gray-50 hover:bg-gray-100';
    }

    return 'hover:bg-gray-50';
  };

  const mobileCardBgClass = (row) => {
    const m = normalize(row?.movement);

    if (m === 'trading_fee') return 'bg-blue-50';

    if (m === 'operating_result') {
      const pct = Number(row?.operatingResultPercent);
      const sign = Number.isFinite(pct) ? pct : Number(row?.amount);
      if (sign > 0) return 'bg-green-50';
      if (sign < 0) return 'bg-red-50';
    }

    return 'bg-white';
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
        <h1 className="text-3xl font-bold text-gray-900">{t('history.title')}</h1>
        <p className="text-gray-600 mt-1">{t('history.subtitle')}</p>
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
                className={`${mobileCardBgClass(row)} rounded-xl shadow-sm border border-gray-200 p-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {movementLabel(row)}
                      </div>
                      {movementCompletedIcon(row)}
                      {shouldShowStatusPill(row?.movement) && row?.status ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${statusPillClass(
                            row.status,
                          )}`}
                        >
                          {translateStatus(row.status)}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatDate(row.date)}</div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-base font-semibold text-gray-900">
                      {formatCurrency(row.amount)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <div className="text-[11px] font-medium text-gray-500">
                      {t('history.table.previousBalance')}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {row.previousBalance !== null ? formatCurrency(row.previousBalance) : '-'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <div className="text-[11px] font-medium text-gray-500">
                      {t('history.table.newBalance')}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {row.newBalance !== null ? formatCurrency(row.newBalance) : '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {shouldPaginateMobile ? (
            <div className="md:hidden flex items-center justify-between gap-3">
              <div className="text-xs text-gray-600">
                {t('common.pageOf', 'Página {{page}} de {{total}}', {
                  page: mobilePage,
                  total: mobileTotalPages,
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
                  disabled={mobilePage <= 1}
                >
                  {t('common.previous', 'Anterior')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="hidden md:block overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('history.table.date')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('history.table.movement')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('history.table.amount')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('history.table.previousBalance')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('history.table.newBalance')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {desktopVisibleRows.map((row, idx) => (
                    <tr key={`${row.code}-${row.date}-${idx}`} className={desktopRowClass(row)}>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{movementLabel(row)}</span>
                          {movementCompletedIcon(row)}
                          {shouldShowStatusPill(row?.movement) && row?.status ? (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusPillClass(
                                row.status,
                              )}`}
                            >
                              {translateStatus(row.status)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                        {row.previousBalance !== null ? formatCurrency(row.previousBalance) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
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
              <div className="text-xs text-gray-600">
                {t('common.pageOf', 'Página {{page}} de {{total}}', {
                  page: desktopPage,
                  total: desktopTotalPages,
                })}
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-600">
                {t('common.rowsPerPage', 'Filas por página')}
                <select
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
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
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setDesktopPage((p) => Math.max(1, p - 1))}
                  disabled={desktopPage <= 1}
                >
                  {t('common.previous', 'Anterior')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
