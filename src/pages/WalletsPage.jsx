import { WalletList } from '../components/features/wallets/WalletList';
import { WALLETS } from '../config/wallets';
import { useTranslation } from 'react-i18next';

export const WalletsPage = () => {
  const { t } = useTranslation();

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

      <WalletList wallets={WALLETS} />
    </div>
  );
};
