import { WalletList } from '../components/features/wallets/WalletList';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useWallets } from '../hooks/useWallets';
import { DepositForm } from '../components/features/requests/DepositForm';
import { Spinner } from '../components/ui/Spinner';

export const WalletsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { wallets, loading, error } = useWallets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('deposits.title')}</h1>
        <p className="text-gray-600 mt-1">{t('deposits.subtitle')}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{t('deposits.warningTitle')}</span>{' '}
          {t('deposits.warningText')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {String(error)}
        </div>
      ) : wallets.length === 0 ? null : (
        <WalletList wallets={wallets} />
      )}

      <DepositForm userName={user?.displayName || 'Investor'} userEmail={user?.email} />
    </div>
  );
};
