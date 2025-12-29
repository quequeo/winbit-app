import { Card } from '../../ui/Card';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatPercentage } from '../../../utils/formatPercentage';

export const KpiCard = ({ title, value, variant }) => {
  const displayValue =
    variant === 'currency'
      ? formatCurrency(value)
      : variant === 'percentage'
        ? formatPercentage(value)
        : String(value ?? '');

  return (
    <Card className="bg-white">
      <div className="space-y-2">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{displayValue}</p>
      </div>
    </Card>
  );
};



