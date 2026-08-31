import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ClipboardList, LineChart, PieChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useInvestorHistory } from '../hooks/useInvestorHistory';
import { useStrategyOperations } from '../hooks/useStrategyOperations';
import { HistoryListSkeleton } from '../components/ui/PageLoading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { DisclaimerCard } from '../components/ui/DisclaimerCard';
import { OperatingTradeCard } from '../components/features/operating/OperatingTradeCard';
import { OperatingDetailView } from '../components/features/operating/OperatingDetailView';
import { OperatingKpiMini } from '../components/features/operating/OperatingKpiMini';
import { OperatingFilterSelect } from '../components/features/operating/OperatingFilterSelect';
import { formatPercentage } from '../utils/formatPercentage';
import { formatUsdSignedDisplay } from '../utils/formatUsdDisplay';
import {
  matchesOperatingFilters,
  operatingDailyPercent,
  getOperatingContractFilterOptions,
  tradeOpenCloseLabels,
  mergeOperatingWithStrategy,
  filterPublishedOperatingResults,
} from '../utils/operatingTrade';
import {
  isOperatingHistoryDemoEnabled,
  getOperatingHistoryDemoData,
} from '../config/operatingHistoryDemoData';

import { getOperatingCalendarRangeStartMs } from '../utils/operatingCalendarRange';

const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const dailyPercent = operatingDailyPercent;

const rowKey = (row, idx) => `${row?.code ?? 'op'}-${row?.date ?? idx}-${idx}`;

export const OperatingPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { userEmail } = useAuth();
  const { data, loading, error, refetch } = useInvestorHistory(userEmail);
  const { strategyByDate } = useStrategyOperations(!loading && !error, data);

  const [range, setRange] = useState('3M');
  const [selectedRow, setSelectedRow] = useState(null);
  const [assetFilter, setAssetFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  const RANGE_OPTIONS = [
    { key: '7D', label: t('operating.ranges.week') },
    { key: '1M', label: t('operating.ranges.month') },
    { key: '3M', label: t('operating.ranges.quarter') },
  ];

  const assetFilterOptions = useMemo(() => getOperatingContractFilterOptions(t), [t]);

  const directionFilterOptions = useMemo(
    () => [
      { id: 'all', label: t('operating.filters.all') },
      { id: 'LONG', label: t('operating.trade.long') },
      { id: 'SHORT', label: t('operating.trade.short') },
    ],
    [t],
  );

  const resultFilterOptions = useMemo(
    () => [
      { id: 'all', label: t('operating.filters.all') },
      { id: 'positive', label: t('operating.filters.positive') },
      { id: 'negative', label: t('operating.filters.negative') },
    ],
    [t],
  );

  const translatedError = (() => {
    if (!error) return null;
    if (error === 'Google Sheets credentials not configured')
      return t('sheets.credentialsNotConfigured');
    if (error === 'Investor email mapping not configured')
      return t('history.errors.emailMappingNotConfigured');
    return error;
  })();

  const allOps = useMemo(() => {
    const fromApi = Array.isArray(data)
      ? data.filter((r) => normalize(r?.movement) === 'operating_result')
      : [];
    const base =
      fromApi.length > 0
        ? fromApi
        : isOperatingHistoryDemoEnabled()
          ? getOperatingHistoryDemoData()
          : [];
    const strategyMap = strategyByDate;
    return filterPublishedOperatingResults(mergeOperatingWithStrategy(base, strategyMap));
  }, [data, strategyByDate]);

  const rows = useMemo(() => {
    const startMs = getOperatingCalendarRangeStartMs(range);
    const filtered = startMs
      ? allOps.filter((r) => {
          const tMs = r?.date ? new Date(r.date).getTime() : 0;
          return tMs >= startMs;
        })
      : allOps;
    return filtered.sort((a, b) => {
      const aT = a?.date ? new Date(a.date).getTime() : 0;
      const bT = b?.date ? new Date(b.date).getTime() : 0;
      return bT - aT;
    });
  }, [allOps, range]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        matchesOperatingFilters(row, {
          asset: assetFilter,
          direction: directionFilter,
          result: resultFilter,
        }),
      ),
    [rows, assetFilter, directionFilter, resultFilter],
  );

  const summary = useMemo(() => {
    const totalAmount = filteredRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const pcts = filteredRows.map((r) => dailyPercent(r)).filter((p) => Number.isFinite(p));
    const totalResultPct = pcts.reduce((acc, pct) => acc + pct, 0);
    return { totalAmount, totalResultPct, count: filteredRows.length };
  }, [filteredRows]);

  useEffect(() => {
    setSelectedRow(null);
  }, [range, assetFilter, directionFilter, resultFilter]);

  useEffect(() => {
    const row = location.state?.operatingRow;
    if (row) {
      setSelectedRow(row);
    }
  }, [location.state]);

  const visibleRows = filteredRows;

  if (loading) {
    return (
      <div className="winbit-page">
        <div className="page-header">
          <h1 className="page-title">{t('operating.title')}</h1>
          <p className="section-subtitle">{t('operating.subtitle')}</p>
        </div>
        <HistoryListSkeleton rows={4} />
      </div>
    );
  }

  if (translatedError) {
    return <ErrorMessage message={translatedError} onRetry={refetch} />;
  }

  if (selectedRow) {
    const { openLabel, closeLabel } = tradeOpenCloseLabels(selectedRow);
    return (
      <OperatingDetailView
        row={selectedRow}
        openLabel={openLabel}
        closeLabel={closeLabel}
        onBack={() => setSelectedRow(null)}
      />
    );
  }

  return (
    <div className="winbit-page">
      <div className="page-header">
        <h1 className="page-title">{t('operating.title')}</h1>
        <p className="section-subtitle">{t('operating.subtitle')}</p>
      </div>

      {allOps.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <OperatingKpiMini
              icon={LineChart}
              label={t('operating.kpis.result')}
              value={formatUsdSignedDisplay(summary.totalAmount)}
              valueClassName={summary.totalAmount >= 0 ? 'text-success' : 'text-error'}
            />
            <OperatingKpiMini
              icon={PieChart}
              label={t('operating.kpis.resultPercent')}
              value={formatPercentage(summary.totalResultPct)}
              valueClassName={summary.totalResultPct >= 0 ? 'text-success' : 'text-error'}
            />
            <OperatingKpiMini
              icon={ClipboardList}
              label={t('operating.kpis.operationsCount')}
              value={String(summary.count)}
              valueClassName="text-primary-soft"
            />
          </div>

          <div className="space-y-3">
            <div className="segment-control w-full sm:w-auto">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRange(opt.key)}
                  className={`segment-control__btn flex-1 sm:flex-none ${range === opt.key ? 'segment-control__btn--active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <OperatingFilterSelect
                label={t('operating.filters.contract')}
                value={assetFilter}
                options={assetFilterOptions}
                onChange={setAssetFilter}
              />
              <OperatingFilterSelect
                label={t('operating.filters.direction')}
                value={directionFilter}
                options={directionFilterOptions}
                onChange={setDirectionFilter}
              />
              <OperatingFilterSelect
                label={t('operating.filters.result')}
                value={resultFilter}
                options={resultFilterOptions}
                onChange={setResultFilter}
              />
            </div>
          </div>
        </>
      ) : null}

      {allOps.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title={t('operating.emptyTitle')}
          description={t('operating.emptyDescription')}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title={t('operating.periodEmptyTitle')}
          description={t('operating.periodEmptyDescription')}
        />
      ) : filteredRows.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title={t('operating.filterEmpty')}
          description={t('operating.emptyDescription')}
        />
      ) : (
        <>
          <div
            data-testid="operating-list"
            className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-1 lg:space-y-3 lg:block"
          >
            {visibleRows.map((row, idx) => {
              const { openLabel, closeLabel } = tradeOpenCloseLabels(row);
              return (
                <OperatingTradeCard
                  key={rowKey(row, idx)}
                  row={row}
                  openLabel={openLabel}
                  closeLabel={closeLabel}
                  onViewDetail={() => setSelectedRow(row)}
                />
              );
            })}
          </div>
        </>
      )}

      {allOps.length > 0 ? <DisclaimerCard>{t('deposits.disclaimer')}</DisclaimerCard> : null}
    </div>
  );
};
