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
  CASH_USD: 'Efectivo USD',
  SWIFT: 'SWIFT',
  CRYPTO: 'Cripto',
  USDT: 'USDT',
  USDC: 'USDC',
  LEMON_CASH: 'Lemon Cash',
};

const STATUS_CONFIG = {
  COMPLETED: {
    label: 'Completado',
    cls: 'badge-completed',
  },
  PENDING: {
    label: 'Pendiente',
    cls: 'badge-pending',
  },
  REJECTED: {
    label: 'Rechazado',
    cls: 'badge-rejected',
  },
  CANCELLED: {
    label: 'Cancelado',
    cls: 'badge-cancelled',
  },
};

const statusConfig = (status) =>
  STATUS_CONFIG[String(status ?? '').toUpperCase()] ?? {
    label: status ?? '—',
    cls: 'badge-cancelled',
  };

export const RequestsPage = () => {
  const { user, userEmail } = useAuth();
  const { data, loading } = useInvestorData(userEmail);
  const { data: history, loading: historyLoading } = useInvestorHistory(userEmail);
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
        <h1 className="text-3xl font-bold text-text-primary">{t('withdrawals.title')}</h1>
        <p className="section-subtitle mt-1">{t('withdrawals.subtitle')}</p>
      </div>

      <div className="border-b border-[rgba(255,255,255,0.08)]">
        <nav className="-mb-px flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'form', label: t('withdrawals.tabs.newRequest') },
            { id: 'history', label: t('withdrawals.tabs.history') },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-1 ${
                tab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
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
          userEmail={userEmail}
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
            <div className="winbit-card text-center text-sm text-text-muted">
              No hay retiros registrados aún.
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {withdrawals.map((r) => {
                  const sc = statusConfig(r.status);
                  return (
                    <div key={r.id} className="winbit-card--compact">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-text-primary">
                            {formatCurrency(Number(r.amount))}
                          </p>
                          <p className="mt-0.5 text-xs text-text-muted">
                            {r.method ? (METHOD_LABELS[r.method] ?? r.method) : '—'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${sc.cls}`}
                        >
                          {sc.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-text-dim">{formatDate(r.date)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto winbit-card !p-0 md:block">
                <table className="min-w-full divide-y divide-[rgba(255,255,255,0.08)] text-sm">
                  <thead className="bg-[rgba(20,20,20,0.55)]">
                    <tr>
                      {['Fecha', 'Monto', 'Método', 'Estado'].map((h) => (
                        <th
                          key={h}
                          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted ${h === 'Monto' ? 'text-right' : 'text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                    {withdrawals.map((r, idx) => {
                      const sc = statusConfig(r.status);
                      return (
                        <tr
                          key={r.id}
                          className={`hover:bg-[rgba(101,167,165,0.08)] transition-colors duration-150 ${idx % 2 === 1 ? 'bg-[rgba(101,167,165,0.03)]' : ''}`}
                        >
                          <td className="px-5 py-3 text-text-primary">{formatDate(r.date)}</td>
                          <td className="px-5 py-3 text-right font-mono font-semibold text-text-primary">
                            {formatCurrency(Number(r.amount))}
                          </td>
                          <td className="px-5 py-3 text-text-muted">
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
