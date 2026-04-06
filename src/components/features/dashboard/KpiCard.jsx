import { Card } from '../../ui/Card';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatPercentage } from '../../../utils/formatPercentage';

export const KpiCard = ({
  title,
  value,
  variant,
  highlighted = false,
  tone = 'default',
  showSign = false,
  displayOverride,
}) => {
  const displayValue =
    displayOverride ??
    (variant === 'currency'
      ? formatCurrency(value, showSign)
      : variant === 'percentage'
        ? formatPercentage(value)
        : String(value ?? ''));

  const cardVariant = highlighted ? 'highlight' : 'default';

  const titleClassName = highlighted ? 'text-sm text-[#8dc8bf]' : 'text-sm text-text-muted';

  const valueClassName = highlighted
    ? 'text-3xl font-bold text-text-primary'
    : tone === 'neutral'
      ? 'text-2xl font-semibold text-text-primary'
      : 'text-2xl font-semibold text-text-primary';

  return (
    <Card
      variant={cardVariant}
      className="transition-transform duration-200 ease-out hover:-translate-y-0.5"
    >
      <div className="space-y-2">
        <p className={titleClassName}>{title}</p>
        <p className={valueClassName}>{displayValue}</p>
      </div>
    </Card>
  );
};
