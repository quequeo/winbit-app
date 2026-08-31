import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AssetBadge } from '../../ui/AssetBadge';
import { OperatingDirectionBadge } from '../../ui/OperatingDirectionBadge';
import { formatPercentage } from '../../../utils/formatPercentage';
import { formatUsdSignedDisplay } from '../../../utils/formatUsdDisplay';
import {
  ASSET_BADGE_SIZE_OPERATING,
  operatingDailyPercent,
  resolveOperatingTradeDisplay,
} from '../../../utils/operatingTrade';

export const OperatingTradeCard = ({ row, openLabel, closeLabel, onViewDetail }) => {
  const { t } = useTranslation();
  const amount = Number(row?.amount) || 0;
  const pct = operatingDailyPercent(row);
  const { badgeKey, assetLabel, direction } = resolveOperatingTradeDisplay(row);
  const isPositive = amount >= 0;
  const hasDirection = direction === 'LONG' || direction === 'SHORT';

  return (
    <div className="operating-trade-card">
      <div className="operating-trade-card__header">
        {badgeKey ? (
          <AssetBadge asset={badgeKey} size={ASSET_BADGE_SIZE_OPERATING} className="shrink-0" />
        ) : (
          <div className="operating-trade-card__logo-fallback" aria-hidden />
        )}
        <div className="operating-trade-card__header-copy min-w-0">
          <p className="operating-trade-card__asset-name">
            {assetLabel || t('operating.trade.unknownAsset')}
          </p>
          {hasDirection ? (
            <OperatingDirectionBadge
              direction={direction}
              longLabel={t('operating.trade.long')}
              shortLabel={t('operating.trade.short')}
            />
          ) : null}
        </div>
      </div>

      <div className="operating-trade-card__times">
        <div>
          <p className="operating-trade-card__meta-label">{t('operating.trade.open')}</p>
          <p className="operating-trade-card__meta-value">{openLabel}</p>
        </div>
        <div>
          <p className="operating-trade-card__meta-label">{t('operating.trade.close')}</p>
          <p className="operating-trade-card__meta-value">{closeLabel}</p>
        </div>
      </div>

      <div className="operating-trade-card__metrics operating-trade-card__metrics--two">
        <div className="operating-trade-card__metric">
          <p className="operating-trade-card__metric-label">{t('operating.trade.result')}</p>
          <p
            className={`operating-trade-card__metric-value ${isPositive ? 'text-success' : 'text-error'}`}
          >
            {formatUsdSignedDisplay(amount)}
          </p>
        </div>
        <div className="operating-trade-card__metric">
          <p className="operating-trade-card__metric-label">{t('operating.trade.impact')}</p>
          <p
            className={`operating-trade-card__metric-value ${
              Number.isFinite(pct) && pct >= 0 ? 'text-success' : 'text-error'
            }`}
          >
            {Number.isFinite(pct) ? formatPercentage(pct) : '—'}
          </p>
        </div>
      </div>

      <button type="button" onClick={onViewDetail} className="operating-trade-card__detail">
        {t('operating.viewDetail')}
        <ChevronRight className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
};
