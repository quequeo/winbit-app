import { useTranslation } from 'react-i18next';
import { formatPercentage } from '../../../utils/formatPercentage';
import { formatUsdSignedDisplay } from '../../../utils/formatUsdDisplay';

export const DashboardPerformanceCard = ({ returnUsd, returnPct, hidden }) => {
  const { t } = useTranslation();
  const isPositive = returnUsd >= 0;
  const toneClass = isPositive ? 'text-positive' : 'text-negative';

  return (
    <div className="dashboard-hero-card dashboard-hero-card--performance">
      <div className="relative z-[1]">
        <p className="dashboard-hero-card__label">{t('dashboard.accumulatedReturn')}</p>
        <div className="dashboard-hero-card__split-metrics">
          <p
            className={`dashboard-hero-card__value dashboard-hero-card__value--metric ${toneClass}`}
          >
            {hidden ? '••••••' : formatUsdSignedDisplay(returnUsd)}
          </p>
          {!hidden ? (
            <>
              <span className="dashboard-hero-card__metric-divider" aria-hidden />
              <p
                className={`dashboard-hero-card__value dashboard-hero-card__value--metric ${toneClass}`}
              >
                {formatPercentage(returnPct)}
              </p>
            </>
          ) : null}
        </div>
        <p className="dashboard-hero-card__aux">{t('dashboard.sinceStart')}</p>
      </div>
    </div>
  );
};
