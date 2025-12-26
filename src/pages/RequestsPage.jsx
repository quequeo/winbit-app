import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';
import { WithdrawalForm } from '../components/features/requests/WithdrawalForm';
import { Spinner } from '../components/ui/Spinner';
import { useTranslation } from 'react-i18next';

export const RequestsPage = () => {
  const { user } = useAuth();
  const { data, loading } = useInvestorData(user?.email);
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('withdrawals.title')}</h1>
        <p className="text-gray-600 mt-1">{t('withdrawals.subtitle')}</p>
      </div>

      <WithdrawalForm
        userName={data?.name || user?.displayName || 'Investor'}
        userEmail={user?.email}
        currentBalance={data?.balance || 0}
      />
    </div>
  );
};
