import { useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { truncateAddress } from '../../../utils/truncateAddress';

export const WalletCard = ({ network, address, icon }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <h4 className="font-semibold text-gray-900">{network}</h4>
            <p className="text-sm text-gray-600 font-mono mt-1">{truncateAddress(address, 8, 6)}</p>
          </div>
        </div>

        <Button onClick={handleCopy} variant="outline" className="text-sm py-2 px-4">
          {copied ? '✓ Copied!' : 'Copy'}
        </Button>
      </div>
    </Card>
  );
};
