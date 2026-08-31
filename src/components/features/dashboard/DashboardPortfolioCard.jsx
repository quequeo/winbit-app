import { useTranslation } from 'react-i18next';
import { formatUsdDisplay } from '../../../utils/formatUsdDisplay';

export const DashboardPortfolioCard = ({ value, capitalInvested, hidden }) => {
  const { t } = useTranslation();

  return (
    <div className="dashboard-hero-card dashboard-hero-card--portfolio">
      <div className="relative z-[1]">
        <p className="dashboard-hero-card__label">{t('dashboard.kpis.currentValue')}</p>
        <p className="dashboard-hero-card__value dashboard-hero-card__value--primary">
          {hidden ? '••••••' : formatUsdDisplay(value)}
        </p>
        <p className="dashboard-hero-card__aux">
          {t('dashboard.capitalInvested')}: {hidden ? '••••••' : formatUsdDisplay(capitalInvested)}
        </p>
      </div>
    </div>
  );
};
