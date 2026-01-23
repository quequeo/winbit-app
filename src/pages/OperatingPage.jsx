import { useMemo } from 'react';
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

const movementText = (row) => {
  const pct = dailyPercent(row);
  return Number.isFinite(pct)
    ? `Resultado Operativo ${formatPercentage(pct)}`
    : 'Resultado Operativo';
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
        <h1 className="text-3xl font-bold text-gray-900">Operativa</h1>
        <p className="text-gray-600 mt-1">Detalle diario de los resultados operativos.</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="📈"
          title="Sin operativas todavía"
          description="Cuando haya resultados operativos, los vas a ver acá."
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div data-testid="operating-mobile" className="md:hidden space-y-3">
            {rows.map((row, idx) => (
              <div
                key={`${row.code}-${row.date}-${idx}`}
                className={`${mobileBgClass(row)} rounded-xl shadow-sm border border-gray-200 p-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {formatDate(row.date)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{movementText(row)}</div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-base font-semibold text-gray-900">
                      {formatCurrency(row.amount)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <div className="text-[11px] font-medium text-gray-500">Saldo previo</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {row.previousBalance !== null ? formatCurrency(row.previousBalance) : '-'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <div className="text-[11px] font-medium text-gray-500">Saldo posterior</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {row.newBalance !== null ? formatCurrency(row.newBalance) : '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Movimiento
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo previo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo posterior
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row, idx) => (
                    <tr key={`${row.code}-${row.date}-${idx}`} className={rowBgClass(row)}>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {movementText(row)}
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
        </>
      )}
    </div>
  );
};
