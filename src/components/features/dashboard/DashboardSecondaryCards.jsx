import { Calendar, Download, FileText, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatPercentage } from '../../../utils/formatPercentage';
import { formatUsdSignedDisplay } from '../../../utils/formatUsdDisplay';

const SecondaryMetricCard = ({ icon: Icon, title, subtitle, valueUsd, valuePct, hidden }) => {
  const isPositive = valueUsd >= 0;
  const toneClass = isPositive ? 'text-positive' : 'text-negative';

  return (
    <div className="dashboard-secondary-card dashboard-secondary-card--tile">
      <div className="dashboard-secondary-card__header">
        <div className="dashboard-secondary-card__icon">
          <Icon className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="dashboard-secondary-card__title">{title}</p>
          {subtitle ? <p className="dashboard-secondary-card__period">{subtitle}</p> : null}
        </div>
      </div>
      {!hidden ? (
        <div className="dashboard-secondary-card__metrics dashboard-secondary-card__metrics--stacked">
          <p className={`dashboard-secondary-card__amount ${toneClass}`}>
            {formatUsdSignedDisplay(valueUsd)}
          </p>
          <span className="dashboard-secondary-card__metric-divider" aria-hidden />
          <p
            className={`dashboard-secondary-card__amount dashboard-secondary-card__amount--pct ${toneClass}`}
          >
            {formatPercentage(valuePct)}
          </p>
        </div>
      ) : (
        <div className="dashboard-secondary-card__metrics dashboard-secondary-card__metrics--stacked">
          <p className="dashboard-secondary-card__amount text-text-muted">••••••</p>
        </div>
      )}
    </div>
  );
};

export const DashboardSecondaryCards = ({
  monthReturnUsd,
  monthReturnPct,
  yearReturnUsd,
  yearReturnPct,
  reportMonthLabel,
  reportDownloadLabel,
  onDownloadReport,
  downloadBusy = false,
  hidden,
}) => {
  const { t } = useTranslation();

  return (
    <div className="dashboard-secondary-stack">
      <div className="dashboard-secondary-stack__metrics">
        <SecondaryMetricCard
          icon={TrendingUp}
          title={t('dashboard.monthResult')}
          subtitle={reportMonthLabel}
          valueUsd={monthReturnUsd}
          valuePct={monthReturnPct}
          hidden={hidden}
        />
        <SecondaryMetricCard
          icon={Calendar}
          title={t('dashboard.annualAccumulated')}
          subtitle={t('dashboard.yearToDate')}
          valueUsd={yearReturnUsd}
          valuePct={yearReturnPct}
          hidden={hidden}
        />
      </div>
      <div className="dashboard-secondary-card dashboard-secondary-card--report">
        <div className="dashboard-secondary-card__header">
          <div className="dashboard-secondary-card__icon">
            <FileText className="w-3 h-3" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="dashboard-secondary-card__title">{t('dashboard.monthlyReport')}</p>
            {reportDownloadLabel ? (
              <p className="dashboard-secondary-card__period">{reportDownloadLabel}</p>
            ) : (
              <p className="dashboard-secondary-card__period">{t('dashboard.reportAvailable')}</p>
            )}
          </div>
        </div>
        <div className="dashboard-secondary-card__action">
          <button
            type="button"
            className="dashboard-icon-btn dashboard-icon-btn--tile"
            aria-label={t('dashboard.downloadReport')}
            disabled={downloadBusy || !onDownloadReport}
            onClick={onDownloadReport}
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
