import { useMemo, useState } from 'react';
import { Check, ChevronRight, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../ui/EmptyState';
import { PaymentMethodIconFromOption } from '../../ui/PaymentMethodIcon';
import { getMethodDescription } from '../../../utils/depositMethodMeta.js';

export const DepositMethodList = ({ options, selectedId, onSelect }) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState(selectedId);

  const flatOptions = useMemo(() => {
    if (!options?.length) return [];
    return [...options].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [options]);

  if (!flatOptions.length) {
    return (
      <EmptyState
        icon={Wallet}
        title={t('deposits.noOptionsTitle')}
        description={t('deposits.noOptionsMessage')}
      />
    );
  }

  const activeId = selectedId ?? flatOptions[0]?.id;

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-text-primary">{t('deposits.chooseMethod')}</h2>
      {flatOptions.map((opt) => {
        const isSelected = activeId === opt.id;
        const isExpanded = expandedId === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              onSelect(opt);
              setExpandedId(opt.id);
            }}
            className={`deposit-method-list-card w-full text-left ${isSelected ? 'deposit-method-list-card--selected' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="payment-method-icon-wrap shrink-0">
                <PaymentMethodIconFromOption option={opt} className="w-7 h-7" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">{opt.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{getMethodDescription(opt, t)}</p>
              </div>
              {isSelected ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[#0a0e12]">
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden />
                </span>
              ) : (
                <ChevronRight className="w-4 h-4 text-text-dim shrink-0" aria-hidden />
              )}
            </div>
            {isSelected && isExpanded ? (
              <p className="mt-2 text-xs text-primary pl-[52px]">{t('deposits.methodSelected')}</p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
