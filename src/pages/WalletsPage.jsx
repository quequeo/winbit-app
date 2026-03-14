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
  CASH_USD: 'Efectivo USD',
  SWIFT: 'SWIFT',
  CRYPTO: 'Cripto',
  USDT: 'USDT',
  USDC: 'USDC',
  LEMON_CASH: 'Lemon Cash',
  BANK_USD: 'Banco USD',
};

const STATUS_CONFIG = {
  COMPLETED: { label: 'Acreditado', cls: 'bg-[rgba(76,175,80,0.15)] text-success' },
  PENDING: { label: 'Pendiente', cls: 'bg-[rgba(255,152,0,0.15)] text-warning' },
  REJECTED: { label: 'Rechazado', cls: 'bg-[rgba(239,83,80,0.15)] text-error' },
  CANCELLED: { label: 'Cancelado', cls: 'bg-dark-section text-text-muted' },
};

const statusConfig = (status) =>
  STATUS_CONFIG[String(status ?? '').toUpperCase()] ?? {
    label: status ?? '—',
    cls: 'bg-dark-section text-text-muted',
  };

export const WalletsPage = () => {
  const { t } = useTranslation();
  const { userEmail } = useAuth();
  const { depositOptions, loading: optionsLoading, error } = useDepositOptions();
  const { data: history, loading: historyLoading } = useInvestorHistory(userEmail);
  const [tab, setTab] = useState('methods');

  const deposits = useMemo(() => {
    if (!Array.isArray(history)) return [];
    return history
      .filter((r) => String(r?.movement ?? '').toUpperCase() === 'DEPOSIT')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{t('deposits.title')}</h1>
      </div>

      <div className="border-b border-border-dark">
        <nav className="-mb-px flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'methods', label: 'Métodos de depósito' },
            { id: 'deposit', label: 'Informar depósito' },
            { id: 'history', label: 'Historial' },
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

      {tab === 'methods' && (
        <div className="space-y-6 py-2">
          <div className="bg-dark-card rounded-xl border border-border-dark p-4 sm:p-6">
            <div className="mb-6 border-b border-border-dark pb-4">
              <h2 className="text-xl font-bold text-text-primary">Métodos de depósito</h2>
              <p className="text-sm text-text-muted mt-2">
                Realizá tu transferencia o depósito utilizando alguno de los siguientes métodos.
              </p>
              <p className="text-sm text-text-muted mt-2">
                Luego de enviar los fondos, dirigite a{' '}
                <span className="font-semibold text-text-primary">
                  {'"'}Informar depósito{'"'}
                </span>{' '}
                para registrar la operación.
              </p>
              <p className="text-sm text-text-muted mt-2">
                Si realizaste un depósito en efectivo, podés dirigirte directamente a{' '}
                <span className="font-semibold text-text-primary">
                  {'"'}Informar depósito{'"'}
                </span>
                .
              </p>
            </div>

            {optionsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-[rgba(239,83,80,0.3)] bg-[rgba(239,83,80,0.15)] p-4 text-sm text-error">
                {String(error)}
              </div>
            ) : (
              <DepositOptionsList options={depositOptions} />
            )}

            <div className="mt-6 pt-4 border-t border-border-dark text-center">
              <p className="text-sm text-text-muted mb-3">{t('deposits.depositButton')}</p>
              <button
                type="button"
                onClick={() => setTab('deposit')}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                {t('deposits.depositButtonAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'deposit' && (
        <div className="space-y-6 py-2">
          <div className="bg-[rgba(101,167,165,0.15)] border border-border-accent rounded-lg p-5">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5 text-info">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-info leading-relaxed">
                <span className="font-bold block mb-1">{t('deposits.warningTitle')}</span>
                {t('deposits.warningText')}
              </p>
            </div>
          </div>

          <DepositForm userEmail={userEmail} depositOptions={depositOptions} />
        </div>
      )}

      {tab === 'history' && (
        <div>
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : deposits.length === 0 ? (
            <div className="rounded-xl border border-border-dark bg-dark-card p-8 text-center text-sm text-text-muted">
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
                      className="rounded-xl border border-border-dark bg-dark-card p-4"
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

              <div className="hidden overflow-x-auto rounded-xl border border-border-dark bg-dark-card md:block">
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
                    {deposits.map((r) => {
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
