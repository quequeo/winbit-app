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

const parseFreeformFields = (details) => {
  const fields = details?.fields;
  if (!Array.isArray(fields)) return [];

  return fields
    .filter((field) => field && typeof field === 'object')
    .map((field) => ({
      key: String(field.label || ''),
      label: String(field.label || ''),
      value: String(field.value || ''),
      copyable: true,
    }))
    .filter((field) => field.label && field.value);
};

const parseLegacyFields = (details) =>
  Object.entries(details)
    .filter(([key, value]) => key !== 'fields' && value)
    .map(([key, value]) => ({
      key,
      label: key,
      value: String(value),
      copyable: COPYABLE_KEYS.includes(key),
    }));

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
  const detailEntries =
    option.category === 'CUSTOM' ? parseFreeformFields(details) : parseLegacyFields(details);

  return (
    <Card variant="compact" className="transition-colors hover:border-[rgba(57, 131, 109,0.35)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-text-primary">{option.label}</h4>
          <span className="text-xs font-medium text-text-primary bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] rounded-full px-2 py-0.5">
            {option.currency}
          </span>
        </div>

        <div className="space-y-2">
          {detailEntries.map((entry) => (
            <div key={entry.key} className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[rgba(230,244,243,0.6)]">
                  {option.category === 'CUSTOM'
                    ? entry.label
                    : t(`deposits.detailLabels.${entry.key}`, entry.key)}
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
