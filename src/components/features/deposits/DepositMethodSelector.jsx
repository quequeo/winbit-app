import { Check, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PaymentMethodIconFromOption } from '../../ui/PaymentMethodIcon';
import { getMethodSubtitle } from '../../../utils/depositMethodMeta.js';

export const DepositMethodSelector = ({
  options,
  selectedId,
  onSelect,
  compact = false,
  comingSoonLabel = 'Próximamente',
}) => {
  const { t } = useTranslation();
  if (!options?.length) return null;

  const displayOptions = [...options];
  const showComingSoon = !compact && displayOptions.length < 4;

  return (
    <div className={`deposit-methods-grid ${compact ? 'deposit-methods-grid--compact' : ''}`}>
      {displayOptions.map((opt) => {
        const isSelected = selectedId === opt.id;
        const subtitle = compact ? null : getMethodSubtitle(opt);

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt)}
            className={`deposit-method-select-card text-left ${compact ? 'deposit-method-select-card--compact' : ''} ${isSelected ? 'deposit-method-select-card--selected' : ''}`}
          >
            {isSelected ? (
              <span className="deposit-method-select-card__check" aria-hidden>
                <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
              </span>
            ) : null}
            {compact ? (
              <div className="deposit-method-select-card__row">
                <div className="payment-method-icon-wrap payment-method-icon-wrap--compact">
                  <PaymentMethodIconFromOption
                    option={opt}
                    className="w-4 h-4"
                    strokeWidth={1.75}
                  />
                </div>
                <p className="deposit-method-select-card__label font-semibold text-text-primary text-xs leading-snug">
                  {opt.label}
                </p>
              </div>
            ) : (
              <>
                <div className="payment-method-icon-wrap mb-3">
                  <PaymentMethodIconFromOption
                    option={opt}
                    className="w-7 h-7"
                    strokeWidth={1.75}
                  />
                </div>
                <p className="font-semibold text-text-primary leading-snug text-sm">{opt.label}</p>
                {subtitle ? <p className="text-xs text-text-muted mt-0.5">{subtitle}</p> : null}
                {isSelected ? (
                  <span className="mt-1 inline-block text-xs text-primary font-medium">
                    {t('deposits.methodSelected')}
                  </span>
                ) : null}
              </>
            )}
          </button>
        );
      })}

      {showComingSoon ? (
        <div className="deposit-method-select-card deposit-method-select-card--disabled opacity-60 cursor-not-allowed">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] mb-3">
            <MoreHorizontal className="w-5 h-5 text-text-muted" strokeWidth={1.75} aria-hidden />
          </div>
          <p className="text-sm font-semibold text-text-muted">{t('deposits.comingSoonMethod')}</p>
          <span className="mt-1 inline-block text-xs text-text-dim">{comingSoonLabel}</span>
        </div>
      ) : null}
    </div>
  );
};
