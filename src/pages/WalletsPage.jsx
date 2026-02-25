import { useMemo, useState } from 'react';
import { DepositOptionsList } from '../components/features/deposits/DepositOptionsList';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useDepositOptions } from '../hooks/useDepositOptions';
import { useInvestorHistory } from '../hooks/useInvestorHistory';
import { DepositForm } from '../components/features/requests/DepositForm';
import { Spinner } from '../components/ui/Spinner';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const METHOD_LABELS = {
  CASH_ARS: 'Efectivo ARS',
  CASH_USD: 'Efectivo USD',
  TRANSFER_ARS: 'Transferencia ARS',
  SWIFT: 'SWIFT',
  CRYPTO: 'Cripto',
  USDT: 'USDT',
  USDC: 'USDC',
  LEMON_CASH: 'Lemon Cash',
  BANK_ARS: 'Banco ARS',
  BANK_USD: 'Banco USD',
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

export const WalletsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { depositOptions, loading: optionsLoading, error } = useDepositOptions();
  const { data: history, loading: historyLoading } = useInvestorHistory(user?.email);
  const [tab, setTab] = useState('deposit');

  const deposits = useMemo(() => {
    if (!Array.isArray(history)) return [];
    return history
      .filter((r) => String(r?.movement ?? '').toUpperCase() === 'DEPOSIT')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('deposits.title')}</h1>
        <p className="text-gray-600 mt-1">{t('deposits.subtitle')}</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {[
            { id: 'deposit', label: 'Depositar' },
            { id: 'history', label: 'Historial de Depósitos' },
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

      {tab === 'deposit' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{t('deposits.warningTitle')}</span>{' '}
              {t('deposits.warningText')}
            </p>
          </div>

          {optionsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {String(error)}
            </div>
          ) : (
            <DepositOptionsList options={depositOptions} />
          )}

          <DepositForm userEmail={user?.email} depositOptions={depositOptions} />
        </>
      )}

      {tab === 'history' && (
        <div>
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : deposits.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              No hay depósitos registrados aún.
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {deposits.map((r) => {
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
                    {deposits.map((r) => {
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
