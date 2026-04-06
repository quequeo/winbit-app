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
  COMPLETED: {
    label: 'Acreditado',
    cls: 'bg-[#8dc8bf]/10 text-[#8dc8bf] border border-[#8dc8bf]/20',
  },
  PENDING: {
    label: 'Pendiente',
    cls: 'bg-[#c2aa72]/10 text-[#c2aa72] border border-[#c2aa72]/20',
  },
  REJECTED: {
    label: 'Rechazado',
    cls: 'bg-red-500/10 text-red-400 border border-red-500/20',
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

      <div className="border-b border-[rgba(255,255,255,0.08)]">
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
                  ? 'border-[#65a7a5] text-[#8dc8bf]'
                  : 'border-transparent text-text-muted hover:text-[#8dc8bf]'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'methods' && (
        <div className="space-y-6 py-2">
          <div className="winbit-card">
            <div className="mb-6 border-b border-[rgba(255,255,255,0.08)] pb-4">
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
                Si realizaste o querés realizar un depósito en efectivo, dirigite directamente a{' '}
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
              <div className="badge-rejected rounded-lg p-4 text-sm">{String(error)}</div>
            ) : (
              <DepositOptionsList options={depositOptions} />
            )}

            <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.08)] text-center">
              <p className="text-sm text-text-muted mb-3">{t('deposits.depositButton')}</p>
              <button
                type="button"
                onClick={() => setTab('deposit')}
                className="inline-flex items-center gap-2 rounded-lg bg-[rgba(101,167,165,0.15)] border border-[rgba(101,167,165,0.35)] px-5 py-2.5 text-sm font-medium text-[#8dc8bf] hover:bg-[rgba(101,167,165,0.25)] hover:border-[rgba(101,167,165,0.55)] transition-colors"
              >
                {t('deposits.depositButtonAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'deposit' && (
        <div className="space-y-6 py-2">
          <div className="info-box">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5 text-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-sm leading-relaxed">
                <span className="font-semibold block mb-1 text-primary">
                  {t('deposits.warningTitle')}
                </span>
                <span className="text-white/[0.88]">{t('deposits.warningText')}</span>
              </div>
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
            <div className="winbit-card text-center text-sm text-text-muted">
              No hay depósitos registrados aún.
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {deposits.map((r) => {
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
                    {deposits.map((r, idx) => {
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
