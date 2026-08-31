import { ArrowDownToLine, ArrowUpFromLine, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ActionRow = ({ icon: Icon, label, to }) => (
  <Link to={to} className="dashboard-quick-action">
    <div className="dashboard-quick-action__icon">
      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden />
    </div>
    <span className="dashboard-quick-action__label">{label}</span>
    <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.5} aria-hidden />
  </Link>
);

export const DashboardQuickActions = () => {
  const { t } = useTranslation();

  return (
    <div className="dashboard-quick-actions-card">
      <h2 className="dashboard-section-title">{t('dashboard.quickActions.title')}</h2>
      <div className="dashboard-quick-actions__list">
        <ActionRow
          icon={ArrowDownToLine}
          label={t('dashboard.quickActions.deposit')}
          to="/wallets"
        />
        <ActionRow
          icon={ArrowUpFromLine}
          label={t('dashboard.quickActions.withdraw')}
          to="/requests"
        />
      </div>
    </div>
  );
};
