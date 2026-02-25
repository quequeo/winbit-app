import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';
import { useInvestorHistory } from '../hooks/useInvestorHistory';
import { WithdrawalForm } from '../components/features/requests/WithdrawalForm';
import { Spinner } from '../components/ui/Spinner';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { useTranslation } from 'react-i18next';

const METHOD_LABELS = {
  CASH_ARS: 'Efectivo ARS',
  CASH_USD: 'Efectivo USD',
  TRANSFER_ARS: 'Transferencia ARS',
  SWIFT: 'SWIFT',
  CRYPTO: 'Cripto',
  USDT: 'USDT',
  USDC: 'USDC',
  LEMON_CASH: 'Lemon Cash',
};

const STATUS_CONFIG = {
  COMPLETED: { label: 'Completado', cls: 'bg-green-100 text-green-800' },
  PENDING: { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-800' },
  REJECTED: { label: 'Rechazado', cls: 'bg-red-100 text-red-800' },
  CANCELLED: { label: 'Cancelado', cls: 'bg-gray-100 text-gray-600' },
};

const statusConfig = (status) =>
  STATUS_CONFIG[String(status ?? '').toUpperCase()] ?? {
    label: status ?? '—',
    cls: 'bg-gray-100 text-gray-600',
  };

export const RequestsPage = () => {
  const { user } = useAuth();
  const { data, loading } = useInvestorData(user?.email);
  const { data: history, loading: historyLoading } = useInvestorHistory(user?.email);
  const { t } = useTranslation();
  const [tab, setTab] = useState('form');

  const withdrawals = useMemo(() => {
    if (!Array.isArray(history)) return [];
    return history
      .filter((r) => String(r?.movement ?? '').toUpperCase() === 'WITHDRAWAL')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  if (loading && tab === 'form') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('withdrawals.title')}</h1>
        <p className="text-gray-600 mt-1">{t('withdrawals.subtitle')}</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {[
            { id: 'form', label: 'Nueva solicitud' },
            { id: 'history', label: 'Historial de Retiros' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'form' && (
        <WithdrawalForm
          userName={data?.name || user?.displayName || 'Investor'}
          userEmail={user?.email}
          currentBalance={data?.balance || 0}
        />
      )}

      {tab === 'history' && (
        <div>
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              No hay retiros registrados aún.
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {withdrawals.map((r) => {
                  const sc = statusConfig(r.status);
                  return (
                    <div
                      key={r.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(Number(r.amount))}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {r.method ? (METHOD_LABELS[r.method] ?? r.method) : '—'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${sc.cls}`}
                        >
                          {sc.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">{formatDate(r.date)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Fecha', 'Monto', 'Método', 'Estado'].map((h) => (
                        <th
                          key={h}
                          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 ${h === 'Monto' ? 'text-right' : 'text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {withdrawals.map((r) => {
                      const sc = statusConfig(r.status);
                      return (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-gray-700">{formatDate(r.date)}</td>
                          <td className="px-5 py-3 text-right font-mono font-semibold text-gray-900">
                            {formatCurrency(Number(r.amount))}
                          </td>
                          <td className="px-5 py-3 text-gray-600">
                            {r.method ? (METHOD_LABELS[r.method] ?? r.method) : '—'}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${sc.cls}`}
                            >
                              {sc.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
