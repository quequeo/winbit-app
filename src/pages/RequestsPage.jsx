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
  COMPLETED: { label: 'Completado', cls: 'bg-[rgba(76,175,80,0.15)] text-success' },
  PENDING: { label: 'Pendiente', cls: 'bg-[rgba(255,152,0,0.15)] text-warning' },
  REJECTED: { label: 'Rechazado', cls: 'bg-[rgba(239,83,80,0.15)] text-error' },
  CANCELLED: { label: 'Cancelado', cls: 'bg-dark-section text-text-muted' },
};

const statusConfig = (status) =>
  STATUS_CONFIG[String(status ?? '').toUpperCase()] ?? {
    label: status ?? '—',
    cls: 'bg-dark-section text-text-muted',
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
        <p className="text-text-muted mt-1">{t('withdrawals.subtitle')}</p>
      </div>

      <div className="border-b border-border-dark">
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
            <div className="rounded-lg border border-border-dark bg-dark-card p-8 text-center text-sm text-text-muted">
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
                      className="rounded-lg border border-border-dark bg-dark-card p-4"
                    >
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

              <div className="hidden overflow-x-auto rounded-lg border border-border-dark bg-dark-card md:block">
                <table className="min-w-full divide-y divide-border-dark text-sm">
                  <thead className="bg-dark-section">
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
                  <tbody className="divide-y divide-border-dark">
                    {withdrawals.map((r) => {
                      const sc = statusConfig(r.status);
                      return (
                        <tr key={r.id} className="hover:bg-accent-dim">
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
