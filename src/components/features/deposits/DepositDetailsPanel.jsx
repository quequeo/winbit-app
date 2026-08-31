import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PaymentMethodIconFromOption } from '../../ui/PaymentMethodIcon';

const COPYABLE_KEYS = [
  'cbu_cvu',
  'alias',
  'lemon_tag',
  'address',
  'swift_code',
  'account_number',
  'iban',
  'holder',
  'bank_name',
  'network',
  'reference',
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

const isCryptoMethod = (option) => {
  const label = String(option?.label ?? '').toLowerCase();
  const category = String(option?.category ?? '').toUpperCase();
  return category === 'CRYPTO' || label.includes('usdt') || label.includes('usdc');
};

export const DepositDetailsPanel = ({ option, compact = false }) => {
  const [copiedKey, setCopiedKey] = useState(null);
  const { t } = useTranslation();

  if (!option) return null;

  const details = option.details || {};
  const detailEntries =
    option.category === 'CUSTOM' ? parseFreeformFields(details) : parseLegacyFields(details);

  const crypto = isCryptoMethod(option);
  const qrValue =
    crypto && (details.address || details.cbu_cvu || details.alias)
      ? details.address || details.cbu_cvu || details.alias
      : null;
  const label = String(option?.label ?? '').toLowerCase();
  const isCash =
    option.category === 'CASH_USD' || label.includes('efectivo') || label.includes('cash usd');

  const handleCopy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div
      className={`winbit-card deposit-details-panel ${compact ? 'deposit-details-panel--compact' : ''}`}
    >
      <div
        className={`flex items-center gap-3 border-b border-[rgba(71, 151, 133,0.12)] ${compact ? 'mb-4 pb-3.5' : 'mb-5 pb-4'}`}
      >
        <div className="payment-method-icon-wrap payment-method-icon-wrap--compact shrink-0">
          <PaymentMethodIconFromOption option={option} className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <h3 className={`font-semibold text-text-primary ${compact ? 'text-sm' : 'text-base'}`}>
          {option.label}
        </h3>
      </div>

      {isCash ? (
        <div className="deposit-details-panel__cash-text py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-text-muted mb-0.5">
            {t('deposits.cashInstructions.title')}
          </p>
          <p className="text-sm text-text-primary leading-relaxed">
            {t('deposits.cashInstructions.detail')}
          </p>
        </div>
      ) : (
        <div className={`grid gap-5 ${qrValue ? 'sm:grid-cols-[1fr_auto] sm:items-start' : ''}`}>
          <div className="space-y-0 min-w-0">
            {detailEntries.map((entry) => (
              <div
                key={entry.key}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted mb-0.5">
                    {option.category === 'CUSTOM'
                      ? entry.label
                      : t(`deposits.detailLabels.${entry.key}`, entry.key)}
                  </p>
                  <p className="text-sm text-text-primary font-mono break-all leading-relaxed">
                    {entry.value}
                  </p>
                </div>
                {entry.copyable ? (
                  <button
                    type="button"
                    onClick={() => handleCopy(entry.value, entry.key)}
                    className="btn-copy shrink-0 p-1.5"
                    aria-label={t('deposits.copy')}
                  >
                    <Copy className="w-3.5 h-3.5" aria-hidden />
                    <span className="sr-only">
                      {copiedKey === entry.key ? t('deposits.copied') : t('deposits.copy')}
                    </span>
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {qrValue ? (
            <div className="flex flex-col items-center justify-start shrink-0 sm:pt-1">
              <div className="rounded-xl bg-white p-2.5 shadow-sm">
                <QRCodeSVG value={qrValue} size={compact ? 104 : 120} level="M" />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
