import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const DashboardStatusBar = ({ lastUpdateLabel }) => {
  const { t } = useTranslation();

  return (
    <div className="dashboard-status-bar">
      <div className="dashboard-status-bar__item">
        <div className="dashboard-status-bar__icon" aria-hidden>
          <Clock className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="dashboard-status-bar__label truncate">
            {t('dashboard.status.lastUpdate')}: {lastUpdateLabel}
          </p>
          <p className="dashboard-status-bar__note">{t('dashboard.status.settlementNote')}</p>
        </div>
      </div>
    </div>
  );
};
