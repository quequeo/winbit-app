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
  return Number.isFinite(pct)
    ? `${base} ${formatPercentage(pct)}`
    : base;
};

const rowBgClass = (row) => {
  const amt = Number(row?.amount);
  if (Number.isFinite(amt) && amt > 0) return 'bg-green-50 hover:bg-green-100';
  if (Number.isFinite(amt) && amt < 0) return 'bg-red-50 hover:bg-red-100';
  return 'hover:bg-gray-50';
};

const mobileBgClass = (row) => {
  const amt = Number(row?.amount);
  if (Number.isFinite(amt) && amt > 0) return 'bg-green-50';
  if (Number.isFinite(amt) && amt < 0) return 'bg-red-50';
  return 'bg-white';
};

export const OperatingPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useInvestorHistory(user?.email);

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
    // Keep pages in bounds when data changes
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
        <h1 className="text-3xl font-bold text-gray-900">{t('operating.title')}</h1>
        <p className="text-gray-600 mt-1">{t('operating.subtitle')}</p>
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
              <div
                key={`${row.code}-${row.date}-${idx}`}
                className={`${mobileBgClass(row)} rounded-xl shadow-sm border border-gray-200 p-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {formatDate(row.date)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{movementText(row, t)}</div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-base font-semibold text-gray-900">
                      {formatCurrency(row.amount)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <div className="text-[11px] font-medium text-gray-500">{t('operating.table.previousBalance')}</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {row.previousBalance !== null ? formatCurrency(row.previousBalance) : '-'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <div className="text-[11px] font-medium text-gray-500">{t('operating.table.newBalance')}</div>
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
            data-testid="operating-desktop"
            className="hidden md:block overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('operating.table.date')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('operating.table.movement')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('operating.table.amount')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('operating.table.previousBalance')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('operating.table.newBalance')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {desktopVisibleRows.map((row, idx) => (
                    <tr key={`${row.code}-${row.date}-${idx}`} className={rowBgClass(row)}>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {movementText(row, t)}
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

            {shouldPaginateDesktop ? (
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-600">
                    {t('common.pageOf', 'Página {{page}} de {{total}}', {
                      page: desktopPage,
                      total: desktopTotalPages,
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-600" htmlFor="operating-page-size-desktop">
                      {t('common.rowsPerPage', 'Filas por página')}
                    </label>
                    <select
                      id="operating-page-size-desktop"
                      className="text-xs rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-gray-700"
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
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
