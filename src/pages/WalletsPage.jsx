import { WalletList } from '../components/features/wallets/WalletList';
import { WALLETS } from '../config/wallets';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useWallets } from '../hooks/useWallets';
import { DepositForm } from '../components/features/requests/DepositForm';
import { Spinner } from '../components/ui/Spinner';

export const WalletsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { wallets, loading, error } = useWallets();

  // Fallback a wallets hardcoded si hay error o no hay backend disponible
  const displayWallets = error || wallets.length === 0 ? WALLETS : wallets;

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
      ) : (
        <WalletList wallets={displayWallets} />
      )}

      <DepositForm userName={user?.displayName || 'Investor'} userEmail={user?.email} />
    </div>
  );
};
