import { useAuth } from '../hooks/useAuth';
import { useInvestorHistory } from '../hooks/useInvestorHistory';
import { Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const HistoryPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useInvestorHistory(user?.email);

  const normalize = (value) =>
    String(value ?? '')
      .trim()
      .toLowerCase();

  const translateMovement = (movement) => {
    const m = normalize(movement);
    if (m === 'depósito' || m === 'deposito' || m === 'deposit') {
      return t('history.movement.deposit');
    }
    if (m === 'retiro' || m === 'withdrawal') {
      return t('history.movement.withdrawal');
    }
    return movement;
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
    return Array.isArray(data) ? data : [];
  }, [data]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aT = a?.date ? new Date(a.date).getTime() : 0;
      const bT = b?.date ? new Date(b.date).getTime() : 0;
      return bT - aT;
    });
  }, [rows]);

  const getStatusBadgeClasses = (status) => {
    const s = normalize(status);
    if (s === 'completado' || s === 'completed') {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (s === 'pendiente' || s === 'pending') {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
    if (s === 'rechazado' || s === 'rejected') {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (s === 'cancelado' || s === 'cancelled' || s === 'canceled') {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

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
            {sortedRows.map((row, idx) => (
              <div
                key={`${row.code}-${row.date}-${idx}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {translateMovement(row.movement)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatDate(row.date)}</div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-base font-semibold text-gray-900">
                      {formatCurrency(row.amount)}
                    </div>
                    <div
                      className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClasses(
                        row.status,
                      )}`}
                    >
                      {translateStatus(row.status)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <div className="text-[11px] font-medium text-gray-500">
                      {t('history.table.previousBalance')}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {formatCurrency(row.previousBalance)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <div className="text-[11px] font-medium text-gray-500">
                      {t('history.table.newBalance')}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {formatCurrency(row.newBalance)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('history.table.status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRows.map((row, idx) => (
                    <tr key={`${row.code}-${row.date}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {translateMovement(row.movement)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(row.previousBalance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(row.newBalance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {translateStatus(row.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
