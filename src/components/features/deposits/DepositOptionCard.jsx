import { useState } from 'react';
import { Card } from '../../ui/Card';
import { useTranslation } from 'react-i18next';

const COPYABLE_KEYS = [
  'cbu_cvu',
  'alias',
  'lemon_tag',
  'address',
  'swift_code',
  'account_number',
  'iban',
];

export const DepositOptionCard = ({ option }) => {
  const [copiedKey, setCopiedKey] = useState(null);
  const { t } = useTranslation();

  const handleCopy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const details = option.details || {};
  const detailEntries = Object.entries(details).filter(([, v]) => v);

  return (
    <Card variant="compact" className="transition-colors hover:border-[rgba(101,167,165,0.35)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-text-primary">{option.label}</h4>
          <span className="text-xs font-medium text-text-muted bg-[rgba(20,20,20,0.55)] rounded-full px-2 py-0.5">
            {option.currency}
          </span>
        </div>

        <div className="space-y-2">
          {detailEntries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-muted">{t(`deposits.detailLabels.${key}`, key)}</p>
                <p className="text-sm text-text-primary font-mono break-all">{value}</p>
              </div>
              {COPYABLE_KEYS.includes(key) && (
                <button
                  type="button"
                  onClick={() => handleCopy(value, key)}
                  className="btn-copy shrink-0 text-xs py-1.5 px-3"
                >
                  {copiedKey === key ? t('deposits.copied') : t('deposits.copy')}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
