import { WalletCard } from './WalletCard';
import { EmptyState } from '../../ui/EmptyState';
import { useTranslation } from 'react-i18next';

export const WalletList = ({ wallets }) => {
  const { t } = useTranslation();

  if (!wallets || wallets.length === 0) {
    return (
      <EmptyState
        icon="💰"
        title={t('deposits.noWalletsTitle')}
        description={t('deposits.noWalletsMessage')}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {wallets.map((wallet) => (
        <WalletCard
          key={wallet.network}
          network={wallet.network}
          address={wallet.address}
          icon={wallet.icon}
        />
      ))}
    </div>
  );
};
