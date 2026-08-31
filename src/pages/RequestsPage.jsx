import { useEffect, useMemo, useState } from 'react';
import { Check, Clock, Grid3x3, X, ArrowDownToLine } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';
import { useInvestorHistory } from '../hooks/useInvestorHistory';
import { WithdrawalForm } from '../components/features/requests/WithdrawalForm';
import { PageTabs } from '../components/ui/PageTabs';
import { FilterChips } from '../components/ui/FilterChips';
import { AvailableBalanceCard } from '../components/ui/AvailableBalanceCard';
import { TransactionHistoryCard } from '../components/ui/TransactionHistoryCard';
import { EmptyState } from '../components/ui/EmptyState';
import { FormSkeleton, HistoryListSkeleton } from '../components/ui/PageLoading';
import { useTranslation } from 'react-i18next';
import {
  getMethodLabel,
  getStatusConfig,
  getStatusLabel,
  buildPaymentMethodOption,
} from '../utils/transactionHelpers';
import { getActivityBalanceImpact } from '../utils/accountActivity';
import { computeWithdrawableBalance } from '../utils/computeWithdrawableBalance';
import {
  isWithdrawalHistoryDemoEnabled,
  withdrawalHistoryDemoData,
} from '../config/withdrawalHistoryDemoData';

const statusIcon = (status) => {
  const key = String(status ?? '').toUpperCase();
  if (key === 'COMPLETED') return Check;
  if (key === 'REJECTED') return X;
  return Clock;
};

export const RequestsPage = () => {
  const { user, userEmail } = useAuth();
  const { data, loading } = useInvestorData(userEmail);
  const { data: history, loading: historyLoading } = useInvestorHistory(userEmail);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(() =>
    searchParams.get('tab') === 'history' ? 'history' : 'form',
  );
  const [historyFilter, setHistoryFilter] = useState('all');

  useEffect(() => {
    if (searchParams.get('tab') === 'history') setTab('history');
  }, [searchParams]);

  const withdrawals = useMemo(() => {
    const apiRows = (Array.isArray(history) ? history : [])
      .filter((r) => String(r?.movement ?? '').toUpperCase() === 'WITHDRAWAL')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (apiRows.length > 0) return apiRows;

    if (!isWithdrawalHistoryDemoEnabled()) return [];

    return [...withdrawalHistoryDemoData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [history]);

  const filteredWithdrawals = useMemo(() => {
    if (historyFilter === 'all') return withdrawals;
    const statusMap = {
      completed: 'COMPLETED',
      pending: 'PENDING',
      rejected: 'REJECTED',
    };
    const target = statusMap[historyFilter];
    return withdrawals.filter((r) => String(r?.status ?? '').toUpperCase() === target);
  }, [withdrawals, historyFilter]);

  const tabs = [
    { id: 'form', label: t('withdrawals.tabs.newRequest') },
    { id: 'history', label: t('withdrawals.tabs.history') },
  ];

  const historyFilters = [
    { id: 'all', label: t('withdrawals.filters.all'), icon: Grid3x3 },
    { id: 'completed', label: t('withdrawals.filters.completed'), icon: Check, iconCircled: true },
    { id: 'pending', label: t('withdrawals.filters.pending'), icon: Clock },
    { id: 'rejected', label: t('withdrawals.filters.rejected'), icon: X, iconCircled: true },
  ];

  const balanceBreakdown = useMemo(
    () =>
      computeWithdrawableBalance({
        portfolioBalance: data?.balance ?? 0,
        history: history ?? [],
      }),
    [data?.balance, history],
  );

  if (loading && tab === 'form') {
    return (
      <div className="winbit-page max-w-3xl mx-auto lg:max-w-none">
        <header className="page-header">
          <h1 className="page-title">{t('withdrawals.title')}</h1>
          <p className="section-subtitle">{t('withdrawals.subtitle')}</p>
        </header>
        <FormSkeleton />
      </div>
    );
  }

  return (
    <div className="winbit-page max-w-3xl mx-auto lg:max-w-none">
      <header className="page-header">
        <h1 className="page-title">{t('withdrawals.title')}</h1>
        <p className="section-subtitle">{t('withdrawals.subtitle')}</p>
      </header>

      <PageTabs tabs={tabs} activeId={tab} onChange={setTab} />

      {tab === 'form' && (
        <div className="winbit-page__stack withdrawal-request">
          <AvailableBalanceCard
            availableForWithdrawal={balanceBreakdown.availableForWithdrawal}
            portfolioBalance={balanceBreakdown.portfolioBalance}
            pendingWithdrawals={balanceBreakdown.pendingWithdrawals}
            pendingFees={balanceBreakdown.pendingFees}
            pendingAdjustments={balanceBreakdown.pendingAdjustments}
          />
          <WithdrawalForm
            userName={data?.name || user?.displayName || 'Investor'}
            userEmail={userEmail}
            currentBalance={data?.balance || 0}
            availableBalance={balanceBreakdown.availableForWithdrawal}
          />
        </div>
      )}

      {tab === 'history' && (
        <div className="transaction-history">
          <FilterChips
            filters={historyFilters}
            activeId={historyFilter}
            onChange={setHistoryFilter}
          />

          {historyLoading ? (
            <HistoryListSkeleton rows={4} />
          ) : withdrawals.length === 0 ? (
            <EmptyState
              icon={ArrowDownToLine}
              title={t('withdrawals.empty.title')}
              description={t('withdrawals.empty.description')}
              actionLabel={t('withdrawals.empty.action')}
              onAction={() => setTab('form')}
            />
          ) : filteredWithdrawals.length === 0 ? (
            <EmptyState
              icon={ArrowDownToLine}
              title={t('withdrawals.filterEmpty')}
              description={t('withdrawals.empty.description')}
            />
          ) : (
            <div className="transaction-history__list">
              {filteredWithdrawals.map((r) => {
                const sc = getStatusConfig(r.status);
                const StatusIcon = statusIcon(r.status);
                return (
                  <TransactionHistoryCard
                    key={r.id}
                    amount={-Math.abs(Number(r.amount) || 0)}
                    conceptLabel={t('history.movement.withdrawal')}
                    methodLabel={getMethodLabel(r.method)}
                    methodOption={buildPaymentMethodOption(r.method)}
                    date={r.date}
                    status={r.status}
                    statusLabel={getStatusLabel(sc, t)}
                    statusIcon={StatusIcon}
                    previousBalance={r.previousBalance}
                    newBalance={r.newBalance}
                    balanceImpactLabel={getActivityBalanceImpact(r, t)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
