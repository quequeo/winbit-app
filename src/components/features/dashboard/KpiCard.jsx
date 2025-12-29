import { Card } from '../../ui/Card';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatPercentage } from '../../../utils/formatPercentage';

export const KpiCard = ({ title, value, variant, highlighted = false }) => {
  const displayValue =
    variant === 'currency'
      ? formatCurrency(value)
      : variant === 'percentage'
        ? formatPercentage(value)
        : String(value ?? '');

  const cardClassName = highlighted
    ? 'bg-gradient-to-r from-[#58b098] to-[#4a9d84] text-white shadow-lg'
    : 'bg-white';

  const titleClassName = highlighted ? 'text-sm text-white/90' : 'text-sm text-gray-600';

  const valueClassName = highlighted
    ? 'text-3xl font-bold text-white'
    : 'text-2xl font-semibold text-gray-900';

  return (
    <Card className={cardClassName}>
      <div className="space-y-2">
        <p className={titleClassName}>{title}</p>
        <p className={valueClassName}>{displayValue}</p>
      </div>
    </Card>
  );
};
