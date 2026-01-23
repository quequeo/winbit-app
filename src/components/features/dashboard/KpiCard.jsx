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
      ? 'bg-gradient-to-r from-[#58b098] to-[#4a9d84] text-white shadow-lg'
      : resolvedTone === 'neutral'
        ? 'bg-gradient-to-r from-sky-50 to-sky-100 border border-sky-200 text-slate-900'
        : 'bg-white';

  const titleClassName =
    resolvedTone === 'highlight'
      ? 'text-sm text-white/90'
      : resolvedTone === 'neutral'
        ? 'text-sm text-sky-700'
        : 'text-sm text-gray-600';

  const valueClassName =
    resolvedTone === 'highlight'
      ? 'text-3xl font-bold text-white'
      : resolvedTone === 'neutral'
        ? 'text-2xl font-semibold text-slate-900'
        : 'text-2xl font-semibold text-gray-900';

  return (
    <Card
      className={`${cardClassName} transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg`}
    >
      <div className="space-y-2">
        <p className={titleClassName}>{title}</p>
        <p className={valueClassName}>{displayValue}</p>
      </div>
    </Card>
  );
};
