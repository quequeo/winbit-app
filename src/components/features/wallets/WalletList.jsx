import { WalletCard } from './WalletCard';
import { EmptyState } from '../../ui/EmptyState';

export const WalletList = ({ wallets }) => {
  if (!wallets || wallets.length === 0) {
    return (
      <EmptyState
        icon="💰"
        title="No Wallets Available"
        description="Wallet addresses will be displayed here when configured."
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

