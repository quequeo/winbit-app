import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DisclaimerCard } from '../../ui/DisclaimerCard';
import { OperatingAssetHeader } from './OperatingAssetLogo';
import { formatPercentage } from '../../../utils/formatPercentage';
import { formatUsdDisplay, formatUsdSignedDisplay } from '../../../utils/formatUsdDisplay';
import {
  formatOperatingDurationLabel,
  formatOperatingPrice,
  getOperatingContractLabel,
  getOperatingDurationMinutes,
  resolveOperatingContract,
  resolveOperatingTradeDisplay,
} from '../../../utils/operatingTrade';

const MiniSparkline = ({ positive }) => {
  const stroke = positive ? '#479785' : '#d48080';
  const points = positive ? '4,36 28,28 52,22 76,14 100,8' : '4,8 28,16 52,24 76,32 100,36';
  return (
    <svg viewBox="0 0 104 44" className="h-24 w-full" aria-hidden>
      <defs>
        <linearGradient id="operatingSpark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
        <filter id="operatingSparkGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline points={`0,44 ${points} 100,44`} fill="url(#operatingSpark)" stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#operatingSparkGlow)"
      />
      <circle
        cx="100"
        cy={positive ? 8 : 36}
        r="4"
        fill={stroke}
        filter="url(#operatingSparkGlow)"
      />
    </svg>
  );
};

export const OperatingDetailView = ({ row, openLabel, closeLabel, onBack }) => {
  const { t } = useTranslation();
  const amount = Number(row?.amount) || 0;
  const prev = Number(row?.previousBalance);
  const next = Number(row?.newBalance);
  const pct =
    Number.isFinite(prev) && prev > 0 && Number.isFinite(amount) ? (amount / prev) * 100 : null;
  const assetKey = resolveOperatingContract(row);
  const { badgeKey, assetLabel, direction } = resolveOperatingTradeDisplay(row);
  const contractLabel = assetLabel ?? getOperatingContractLabel(assetKey, t) ?? '—';
  const isPositive = amount >= 0;
  const resultTone = isPositive ? 'text-success' : 'text-error';

  const durationMinutes = getOperatingDurationMinutes(
    row?.openedAt ?? row?.opened_at,
    row?.closedAt ?? row?.closed_at,
  );
  const durationLabel = formatOperatingDurationLabel(durationMinutes, t);

  const entryPrice = Number(row?.entryPrice);
  const exitPrice = Number(row?.exitPrice);

  const detailRows = [
    { label: t('operating.detail.openDate'), value: openLabel || '—' },
    { label: t('operating.detail.closeDate'), value: closeLabel || '—' },
    { label: t('operating.detail.duration'), value: durationLabel },
    ...(row?.timeframe ? [{ label: t('operating.detail.timeframe'), value: row.timeframe }] : []),
    {
      label: t('operating.detail.entryPrice'),
      value: Number.isFinite(entryPrice) ? formatOperatingPrice(entryPrice) : '—',
    },
    {
      label: t('operating.detail.exitPrice'),
      value: Number.isFinite(exitPrice) ? formatOperatingPrice(exitPrice) : '—',
    },
    {
      label: t('operating.detail.portfolioValueBefore'),
      value: Number.isFinite(prev) ? formatUsdDisplay(prev) : '—',
    },
    {
      label: t('operating.detail.portfolioValueAfter'),
      value: Number.isFinite(next) ? formatUsdDisplay(next) : '—',
    },
    {
      label: t('operating.detail.resultPercent'),
      value: Number.isFinite(pct) ? formatPercentage(pct) : '—',
      tone: Number.isFinite(pct) ? (pct >= 0 ? 'text-success' : 'text-error') : null,
    },
  ];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden />
        {t('operating.detail.title')}
      </button>

      <div className="operating-trade-card">
        <OperatingAssetHeader
          badgeKey={badgeKey}
          assetLabel={contractLabel === '—' ? null : contractLabel}
          direction={direction}
          t={t}
        />

        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <p className="text-xs text-text-muted">{t('operating.kpis.result')}</p>
            <p className={`text-lg font-bold ${resultTone}`}>{formatUsdSignedDisplay(amount)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">{t('operating.kpis.resultPercent')}</p>
            <p className={`text-lg font-bold ${resultTone}`}>
              {Number.isFinite(pct) ? formatPercentage(pct) : '—'}
            </p>
          </div>
        </div>

        <MiniSparkline positive={isPositive} />

        <dl className="mt-4 space-y-3">
          {detailRows.map(({ label, value, tone }) => (
            <div key={label} className="flex items-start justify-between gap-4 text-sm">
              <dt className="text-text-muted shrink-0">{label}</dt>
              <dd className={`text-right font-medium ${tone || 'text-text-primary'}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <DisclaimerCard>{t('deposits.disclaimer')}</DisclaimerCard>
    </div>
  );
};
