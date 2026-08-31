import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';
import { useInvestorHistory } from '../hooks/useInvestorHistory';
import { useStrategyOperations } from '../hooks/useStrategyOperations';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { downloadInvestorMonthlyReport } from '../services/api';
import { DashboardStatusBar } from '../components/features/dashboard/DashboardStatusBar';
import { DashboardPortfolioCard } from '../components/features/dashboard/DashboardPortfolioCard';
import { DashboardPerformanceCard } from '../components/features/dashboard/DashboardPerformanceCard';
import { DashboardSecondaryCards } from '../components/features/dashboard/DashboardSecondaryCards';
import { DashboardCapitalChart } from '../components/features/dashboard/DashboardCapitalChart';
import { DashboardQuickActions } from '../components/features/dashboard/DashboardQuickActions';
import { DashboardMovementsTable } from '../components/features/dashboard/DashboardMovementsTable';
import { DashboardOperationsTable } from '../components/features/dashboard/DashboardOperationsTable';
import { DashboardSkeleton } from '../components/features/dashboard/DashboardSkeleton';
import { DisclaimerCard } from '../components/ui/DisclaimerCard';
import { Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useToast } from '../components/ui/ToastProvider';
import { UnauthorizedPage } from './UnauthorizedPage';
import { formatName } from '../utils/formatName';
import { buildDashboardViewModel } from '../utils/dashboardViewModel';

const BALANCE_HIDDEN_KEY = 'winbit-dashboard-hide-balances';

const triggerBrowserDownload = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};

export const DashboardPage = () => {
  const { userEmail } = useAuth();
  const { data, loading, error, unauthorized, refetch } = useInvestorData(userEmail);
  const { data: historyData, loading: historyLoading } = useInvestorHistory(userEmail);
  const { strategyByDate } = useStrategyOperations(!loading && !error, historyData);
  const { t } = useTranslation();
  const { showToast } = useToast();
  const showSkeleton = useDelayedLoading(loading);
  const [reportDownloading, setReportDownloading] = useState(false);

  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    try {
      return globalThis?.localStorage?.getItem(BALANCE_HIDDEN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden((prev) => {
      const next = !prev;
      try {
        globalThis?.localStorage?.setItem(BALANCE_HIDDEN_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleDownloadReport = async () => {
    if (!userEmail || reportDownloading) return;
    setReportDownloading(true);
    try {
      const { data: report, error: reportError } = await downloadInvestorMonthlyReport(userEmail);
      if (reportError === 'REPORT_NOT_FOUND') {
        showToast({
          type: 'error',
          title: t('dashboard.monthlyReport'),
          message: t('dashboard.reportNotFound'),
        });
        return;
      }
      if (reportError || !report?.blob) {
        showToast({
          type: 'error',
          title: t('dashboard.monthlyReport'),
          message: t('dashboard.reportDownloadError'),
        });
        return;
      }
      triggerBrowserDownload(report.blob, report.filename);
      showToast({
        type: 'success',
        title: t('dashboard.monthlyReport'),
        message: t('dashboard.reportDownloadStarted'),
      });
    } finally {
      setReportDownloading(false);
    }
  };

  const vm = useMemo(
    () => (data ? buildDashboardViewModel(data, historyData, strategyByDate) : null),
    [data, historyData, strategyByDate],
  );

  if (loading) {
    return showSkeleton ? (
      <DashboardSkeleton />
    ) : (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (unauthorized) {
    return <UnauthorizedPage />;
  }

  if (error) {
    const message =
      error === 'Google Sheets credentials not configured'
        ? t('sheets.credentialsNotConfigured')
        : error;
    return <ErrorMessage message={message} onRetry={refetch} />;
  }

  if (!data || !vm) {
    return <ErrorMessage message={t('dashboard.noDataForAccount')} />;
  }

  return (
    <div className="dashboard-page" data-testid="dashboard-page">
      <section className="dashboard-snap-screen dashboard-snap-screen--primary">
        <header className="dashboard-header">
          <div className="flex items-start gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <h1 className="page-title">
                  {t('dashboard.welcomeBack', { name: formatName(data.name) })}
                </h1>
                <button
                  type="button"
                  onClick={toggleBalanceVisibility}
                  className="text-text-muted hover:text-text-primary transition-colors shrink-0 mt-1"
                  aria-label={
                    isBalanceHidden ? t('dashboard.showBalances') : t('dashboard.hideBalances')
                  }
                >
                  {isBalanceHidden ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              <p className="section-subtitle">{t('dashboard.investmentSummary')}</p>
            </div>
          </div>
          <DashboardStatusBar lastUpdateLabel={vm.lastUpdateLabel} />
        </header>

        <div className="dashboard-section dashboard-section--hero">
          <DashboardPortfolioCard
            value={vm.portfolioValue}
            capitalInvested={vm.capitalInvested}
            hidden={isBalanceHidden}
          />
          <DashboardPerformanceCard
            returnUsd={vm.accumulatedReturnUsd}
            returnPct={vm.accumulatedReturnPct}
            hidden={isBalanceHidden}
          />
        </div>

        <DashboardSecondaryCards
          monthReturnUsd={vm.monthReturnUsd}
          monthReturnPct={vm.monthReturnPct}
          yearReturnUsd={vm.yearReturnUsd}
          yearReturnPct={vm.yearReturnPct}
          reportMonthLabel={vm.reportMonthLabel}
          reportDownloadLabel={vm.reportDownloadLabel}
          onDownloadReport={handleDownloadReport}
          downloadBusy={reportDownloading}
          hidden={isBalanceHidden}
        />

        <div
          data-testid="portfolio-evolution"
          className="dashboard-section dashboard-section--chart"
        >
          {historyLoading ? (
            <div className="winbit-card text-sm text-text-muted">
              {t('dashboard.chart.loading')}
            </div>
          ) : (
            <DashboardCapitalChart series={vm.chartSeries} periodLabel={vm.chartPeriodLabel} />
          )}
        </div>
      </section>

      <section className="dashboard-snap-screen dashboard-snap-screen--secondary">
        <div className="dashboard-section dashboard-section--quick-actions">
          <DashboardQuickActions />
        </div>

        <DashboardOperationsTable operations={vm.recentOperations} hidden={isBalanceHidden} />
        <DashboardMovementsTable movements={vm.recentMovements} hidden={isBalanceHidden} />

        <DisclaimerCard className="dashboard-disclaimer">
          {t('dashboard.disclaimer')}
        </DisclaimerCard>
      </section>
    </div>
  );
};
