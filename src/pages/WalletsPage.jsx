import { WalletList } from '../components/features/wallets/WalletList';
import { WALLETS } from '../config/wallets';

export const WalletsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deposit Wallets</h1>
        <p className="text-gray-600 mt-1">
          Use these wallet addresses to deposit funds to your portfolio
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Important:</span> Always verify the network before sending
          funds. Sending to the wrong network may result in loss of funds.
        </p>
      </div>

      <WalletList wallets={WALLETS} />
    </div>
  );
};
