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
  'routing_number',
];

const buildDetailEntries = (details = {}) => {
  if (Array.isArray(details.fields)) {
    return details.fields
      .filter((field) => field && (field.label || field.value))
      .map((field, index) => ({
        key: `custom-${index}`,
        label: String(field.label || ''),
        value: String(field.value ?? ''),
        copyable: true,
      }));
  }

  return Object.entries(details)
    .filter(([, value]) => value != null && value !== '' && typeof value !== 'object')
    .map(([key, value]) => ({
      key,
      labelKey: key,
      value: String(value),
      copyable: COPYABLE_KEYS.includes(key),
    }));
};

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

  const detailEntries = buildDetailEntries(option.details || {});

  return (
    <Card variant="compact" className="transition-colors hover:border-[rgba(101,167,165,0.35)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-text-primary">{option.label}</h4>
          <span className="text-xs font-medium text-white bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] rounded-full px-2 py-0.5">
            {option.currency}
          </span>
        </div>

        <div className="space-y-2">
          {detailEntries.map((entry) => (
            <div key={entry.key} className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[rgba(230,244,243,0.6)]">
                  {entry.label || t(`deposits.detailLabels.${entry.labelKey}`, entry.labelKey)}
                </p>
                <p className="text-sm text-[#f3fbfb] font-mono break-all">{entry.value}</p>
              </div>
              {entry.copyable && (
                <button
                  type="button"
                  onClick={() => handleCopy(entry.value, entry.key)}
                  className="btn-copy shrink-0 text-xs py-1.5 px-3"
                >
                  {copiedKey === entry.key ? t('deposits.copied') : t('deposits.copy')}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
