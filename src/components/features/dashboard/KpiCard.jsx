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
}) => {
  const displayValue =
    variant === 'currency'
      ? formatCurrency(value, showSign)
      : variant === 'percentage'
        ? formatPercentage(value)
        : String(value ?? '');

  const resolvedTone = highlighted ? 'highlight' : tone;

  const cardClassName =
    resolvedTone === 'highlight'
      ? 'bg-gradient-to-r from-primary to-[#4a9d8e] text-white'
      : resolvedTone === 'neutral'
        ? 'bg-[rgba(101,167,165,0.06)] border border-border-accent'
        : 'bg-dark-card';

  const titleClassName =
    resolvedTone === 'highlight'
      ? 'text-sm text-white/90'
      : resolvedTone === 'neutral'
        ? 'text-sm text-text-muted'
        : 'text-sm text-text-muted';

  const valueClassName =
    resolvedTone === 'highlight'
      ? 'text-3xl font-bold text-white'
      : resolvedTone === 'neutral'
        ? 'text-2xl font-semibold text-text-primary'
        : 'text-2xl font-semibold text-text-primary';

  return (
    <Card
      className={`${cardClassName} transition-transform duration-200 ease-out hover:-translate-y-0.5`}
    >
      <div className="space-y-2">
        <p className={titleClassName}>{title}</p>
        <p className={valueClassName}>{displayValue}</p>
      </div>
    </Card>
  );
};
