import { Card } from '../../ui/Card';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatPercentage } from '../../../utils/formatPercentage';

export const BalanceCard = ({ balance, totalInvested, returns }) => {
  return (
    <Card className="bg-gradient-to-br from-primary to-primary/80 text-white">
      <div className="space-y-4">
        <div>
          <p className="text-sm opacity-90">Current Balance</p>
          <h2 className="text-4xl font-bold mt-1">{formatCurrency(balance)}</h2>
        </div>
        
        <div className="flex gap-8 pt-4 border-t border-white/20">
          <div>
            <p className="text-sm opacity-90">Total Invested</p>
            <p className="text-xl font-semibold mt-1">
              {formatCurrency(totalInvested)}
            </p>
          </div>
          
          <div>
            <p className="text-sm opacity-90">Returns</p>
            <p className={`text-xl font-semibold mt-1 ${
              returns >= 0 ? 'text-green-200' : 'text-red-200'
            }`}>
              {formatPercentage(returns)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

