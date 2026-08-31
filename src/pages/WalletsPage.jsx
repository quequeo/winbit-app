import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Clock, CreditCard, Check, X, Inbox, Grid3x3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { DepositMethodSelector } from '../components/features/deposits/DepositMethodSelector';
import { DepositDetailsPanel } from '../components/features/deposits/DepositDetailsPanel';
import { DepositForm } from '../components/features/requests/DepositForm';
import { PageTabs } from '../components/ui/PageTabs';
import { FilterChips } from '../components/ui/FilterChips';
import { TransactionHistoryCard } from '../components/ui/TransactionHistoryCard';
import { EmptyState } from '../components/ui/EmptyState';
import { DisclaimerCard } from '../components/ui/DisclaimerCard';
import { HistoryListSkeleton } from '../components/ui/PageLoading';
import { Spinner } from '../components/ui/Spinner';
import { ReceiptAttachment } from '../components/features/attachments/ReceiptAttachment';
import { useAuth } from '../hooks/useAuth';
import { useDepositOptions } from '../hooks/useDepositOptions';
import { useInvestorHistory } from '../hooks/useInvestorHistory';
import {
  getMethodLabel,
  getStatusConfig,
  getStatusLabel,
  buildPaymentMethodOption,
} from '../utils/transactionHelpers';
import { getActivityBalanceImpact } from '../utils/accountActivity';

export const WalletsPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { userEmail } = useAuth();
  const { depositOptions, loading: optionsLoading, error } = useDepositOptions();
  const { data: history, loading: historyLoading } = useInvestorHistory(userEmail);
  const [tab, setTab] = useState(() =>
    searchParams.get('tab') === 'history' ? 'history' : 'deposit',
  );
  const [selectedOption, setSelectedOption] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    if (searchParams.get('tab') === 'history') setTab('history');
  }, [searchParams]);

  const sortedOptions = useMemo(() => {
    if (!depositOptions?.length) return [];
    return [...depositOptions].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [depositOptions]);

  const activeOption = useMemo(() => {
    if (selectedOption) return selectedOption;
    return sortedOptions[0] ?? null;
  }, [selectedOption, sortedOptions]);

  const deposits = useMemo(() => {
    if (!Array.isArray(history)) return [];
    return history
      .filter((r) => String(r?.movement ?? '').toUpperCase() === 'DEPOSIT')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  const filteredDeposits = useMemo(() => {
    if (historyFilter === 'all') return deposits;
    const statusMap = {
      completed: 'COMPLETED',
      pending: 'PENDING',
      rejected: 'REJECTED',
    };
    const target = statusMap[historyFilter];
    return deposits.filter((r) => String(r?.status ?? '').toUpperCase() === target);
  }, [deposits, historyFilter]);

  const tabs = [
    { id: 'deposit', label: t('deposits.tabs.deposit'), icon: CreditCard },
    { id: 'history', label: t('deposits.tabs.history'), icon: Clock },
  ];

  const historyFilters = [
    { id: 'all', label: t('deposits.filters.all'), icon: Grid3x3 },
    { id: 'completed', label: t('deposits.filters.accredited'), icon: Check, iconCircled: true },
    { id: 'pending', label: t('deposits.filters.pending'), icon: Clock },
    { id: 'rejected', label: t('deposits.filters.rejected'), icon: X, iconCircled: true },
  ];

  const statusIcon = (status) => {
    const key = String(status ?? '').toUpperCase();
    if (key === 'COMPLETED') return Check;
    if (key === 'REJECTED') return X;
    return Clock;
  };

  const renderDepositHistoryRows = (rows) => (
    <div className="transaction-history__list">
      {rows.map((r) => {
        const sc = getStatusConfig(r.status, 'deposit');
        const StatusIcon = statusIcon(r.status);
        return (
          <TransactionHistoryCard
            key={r.id}
            amount={Number(r.amount)}
            conceptLabel={t('history.movement.deposit')}
            methodLabel={getMethodLabel(r.method)}
            methodOption={buildPaymentMethodOption(r.method)}
            date={r.date}
            status={r.status}
            statusLabel={getStatusLabel(sc, t)}
            statusIcon={StatusIcon}
            previousBalance={r.previousBalance}
            newBalance={r.newBalance}
            balanceImpactLabel={getActivityBalanceImpact(r, t)}
            secondaryActionLabel={r.attachmentUrl ? `${t('deposits.viewDetail')} ›` : null}
            onSecondaryAction={
              r.attachmentUrl ? () => setReceiptPreviewUrl(r.attachmentUrl) : undefined
            }
          />
        );
      })}
    </div>
  );

  return (
    <div className="winbit-page">
      {receiptPreviewUrl ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setReceiptPreviewUrl(null)}
            aria-hidden
          />
          <div className="winbit-overlay-panel">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-text-primary">
                {t('history.viewReceipt', 'Ver comprobante')}
              </h2>
              <button
                type="button"
                onClick={() => setReceiptPreviewUrl(null)}
                className="text-sm font-semibold text-text-muted hover:text-text-primary"
              >
                {t('common.close', 'Cerrar')}
              </button>
            </div>
            <ReceiptAttachment url={receiptPreviewUrl} />
          </div>
        </div>
      ) : null}

      <div className="page-header">
        <h1 className="page-title">{t('deposits.title')}</h1>
        <p className="section-subtitle">
          {tab === 'history' ? t('deposits.historySubtitle') : t('deposits.pageSubtitleShort')}
        </p>
      </div>

      <PageTabs tabs={tabs} activeId={tab} onChange={setTab} />

      {tab === 'deposit' && (
        <div className="deposit-page max-w-2xl">
          <div className="deposit-page__body">
            {optionsLoading ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : error ? (
              <div className="badge-rejected rounded-lg p-4 text-sm">{String(error)}</div>
            ) : (
              <div className="deposit-page__stack">
                <DepositMethodSelector
                  options={sortedOptions}
                  selectedId={activeOption?.id}
                  onSelect={(opt) => {
                    setSelectedOption(opt);
                    setShowReportForm(false);
                  }}
                  compact
                  comingSoonLabel={t('deposits.comingSoon')}
                />
                {activeOption ? <DepositDetailsPanel option={activeOption} compact /> : null}
                <DisclaimerCard title={t('common.important')}>
                  {t('deposits.warningText')}
                </DisclaimerCard>
              </div>
            )}

            {showReportForm ? (
              <div className="deposit-page__form space-y-4 pt-2">
                <p className="deposit-form-heading">
                  <ClipboardList
                    className="deposit-form-heading__icon"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span>{t('deposits.requestForm.title')}</span>
                </p>
                <DepositForm
                  userEmail={userEmail}
                  depositOptions={depositOptions}
                  selectedOptionId={activeOption?.id}
                  hideTitle
                />
              </div>
            ) : null}
          </div>

          {!showReportForm ? (
            <div className="deposit-page__footer">
              <button
                type="button"
                onClick={() => setShowReportForm(true)}
                className="btn-gradient deposit-report-btn w-full flex items-center justify-center gap-2.5"
              >
                <ClipboardList className="w-[18px] h-[18px] shrink-0" strokeWidth={2} aria-hidden />
                <span>{t('deposits.depositButtonAction')}</span>
              </button>
            </div>
          ) : null}
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
          ) : deposits.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={t('deposits.empty.title')}
              description={t('deposits.empty.description')}
              actionLabel={t('deposits.empty.action')}
              onAction={() => {
                setTab('deposit');
                setShowReportForm(true);
              }}
            />
          ) : filteredDeposits.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={t('deposits.filterEmpty')}
              description={t('deposits.empty.description')}
            />
          ) : (
            renderDepositHistoryRows(filteredDeposits)
          )}
        </div>
      )}
    </div>
  );
};
