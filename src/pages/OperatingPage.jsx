import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useInvestorHistory } from '../hooks/useInvestorHistory';
import { Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { formatPercentage } from '../utils/formatPercentage';

const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const dailyPercent = (row) => {
  const prev = Number(row?.previousBalance);
  const amt = Number(row?.amount);
  if (!Number.isFinite(prev) || prev <= 0) return null;
  if (!Number.isFinite(amt)) return null;
  return (amt / prev) * 100;
};

const movementText = (row, t) => {
  const pct = dailyPercent(row);
  const base = t('operating.movement.operatingResult');
  return Number.isFinite(pct) ? `${base} ${formatPercentage(pct)}` : base;
};

const rowBgClass = (row) => {
  const amt = Number(row?.amount);
  if (Number.isFinite(amt) && amt > 0) return 'row-positive';
  if (Number.isFinite(amt) && amt < 0) return 'row-negative';
  return 'hover:bg-[rgba(101,167,165,0.08)]';
};

const mobileAmountColor = (row) => {
  const amt = Number(row?.amount);
  if (Number.isFinite(amt) && amt > 0) return 'text-success';
  if (Number.isFinite(amt) && amt < 0) return 'text-error';
  return 'text-text-primary';
};

export const OperatingPage = () => {
  const { t } = useTranslation();
  const { userEmail } = useAuth();
  const { data, loading, error, refetch } = useInvestorHistory(userEmail);

  const MOBILE_PAGE_SIZE = 20;
  const DESKTOP_PAGE_SIZE_OPTIONS = [10, 20, 50];
  const [desktopPageSize, setDesktopPageSize] = useState(20);
  const [mobilePage, setMobilePage] = useState(1);
  const [desktopPage, setDesktopPage] = useState(1);

  const translatedError = (() => {
    if (!error) return null;
    if (error === 'Google Sheets credentials not configured')
      return t('sheets.credentialsNotConfigured');
    if (error === 'Investor email mapping not configured')
      return t('history.errors.emailMappingNotConfigured');
    return error;
  })();

  const rows = useMemo(() => {
    const raw = Array.isArray(data) ? data : [];
    const ops = raw.filter((r) => normalize(r?.movement) === 'operating_result');
    return ops.sort((a, b) => {
      const aT = a?.date ? new Date(a.date).getTime() : 0;
      const bT = b?.date ? new Date(b.date).getTime() : 0;
      return bT - aT;
    });
  }, [data]);

  const mobileTotalPages = useMemo(() => {
    const n = Math.ceil(rows.length / MOBILE_PAGE_SIZE);
    return n > 0 ? n : 1;
  }, [rows.length]);

  const desktopTotalPages = useMemo(() => {
    const n = Math.ceil(rows.length / desktopPageSize);
    return n > 0 ? n : 1;
  }, [rows.length, desktopPageSize]);

  useEffect(() => {
    setMobilePage((p) => Math.min(Math.max(1, p), mobileTotalPages));
  }, [mobileTotalPages]);

  useEffect(() => {
    setDesktopPage((p) => Math.min(Math.max(1, p), desktopTotalPages));
  }, [desktopTotalPages]);

  const mobileVisibleRows = useMemo(() => {
    const start = (mobilePage - 1) * MOBILE_PAGE_SIZE;
    return rows.slice(start, start + MOBILE_PAGE_SIZE);
  }, [rows, mobilePage]);

  const desktopVisibleRows = useMemo(() => {
    const start = (desktopPage - 1) * desktopPageSize;
    return rows.slice(start, start + desktopPageSize);
  }, [rows, desktopPage, desktopPageSize]);

  const shouldPaginateMobile = rows.length > MOBILE_PAGE_SIZE;
  const shouldPaginateDesktop = rows.length > desktopPageSize;

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
        <h1 className="text-3xl font-bold text-text-primary">{t('operating.title')}</h1>
        <p className="section-subtitle mt-1">{t('operating.subtitle')}</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="📈"
          title={t('operating.emptyTitle')}
          description={t('operating.emptyDescription')}
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div data-testid="operating-mobile" className="md:hidden space-y-3">
            {mobileVisibleRows.map((row, idx) => (
              <div key={`${row.code}-${row.date}-${idx}`} className="winbit-card--compact">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-primary whitespace-normal break-words">
                      {formatDate(row.date)}
                    </div>
                    <div className="text-xs text-text-muted mt-1">{movementText(row, t)}</div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className={`text-base font-bold ${mobileAmountColor(row)}`}>
                      {Number(row.amount) > 0 ? '+' : ''}
                      {formatCurrency(row.amount)}
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
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,255,255,0.08)] text-text-primary hover:bg-[rgba(101,167,165,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
                  disabled={mobilePage <= 1}
                >
                  {t('common.previous', 'Anterior')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,255,255,0.08)] text-text-primary hover:bg-[rgba(101,167,165,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
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
            data-testid="operating-desktop"
            className="hidden md:block overflow-hidden winbit-card !p-0"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[rgba(255,255,255,0.08)]">
                <thead className="bg-[rgba(20,20,20,0.55)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      {t('operating.table.date')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      {t('operating.table.movement')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                      {t('operating.table.amount')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                      {t('operating.table.previousBalance')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                      {t('operating.table.newBalance')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {desktopVisibleRows.map((row, idx) => (
                    <tr
                      key={`${row.code}-${row.date}-${idx}`}
                      className={`${rowBgClass(row)} transition-colors duration-150 ${idx % 2 === 1 ? 'bg-[rgba(101,167,165,0.03)]' : ''}`}
                    >
                      <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                        {movementText(row, t)}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary text-right whitespace-nowrap">
                        {formatCurrency(row.amount)}
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

            {shouldPaginateDesktop ? (
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-text-muted">
                    {t('common.pageOf', 'Página {{page}} de {{total}}', {
                      page: desktopPage,
                      total: desktopTotalPages,
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      className="text-xs font-medium text-text-muted"
                      htmlFor="operating-page-size-desktop"
                    >
                      {t('common.rowsPerPage', 'Filas por página')}
                    </label>
                    <select
                      id="operating-page-size-desktop"
                      className="text-xs rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(15,18,18,0.8)] px-2 py-1.5 text-text-primary"
                      value={desktopPageSize}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        if (Number.isFinite(next) && next > 0) {
                          setDesktopPageSize(next);
                          setDesktopPage(1);
                        }
                      }}
                    >
                      {DESKTOP_PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,255,255,0.08)] text-text-primary hover:bg-[rgba(101,167,165,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setDesktopPage((p) => Math.max(1, p - 1))}
                    disabled={desktopPage <= 1}
                  >
                    {t('common.previous', 'Anterior')}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,255,255,0.08)] text-text-primary hover:bg-[rgba(101,167,165,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setDesktopPage((p) => Math.min(desktopTotalPages, p + 1))}
                    disabled={desktopPage >= desktopTotalPages}
                  >
                    {t('common.next', 'Siguiente')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
