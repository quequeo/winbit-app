import { OperatingAssetTitleRow } from './OperatingAssetTitleRow';
import { ASSET_BADGE_SIZE_OPERATING } from '../../../utils/operatingTrade';

export const OperatingAssetHeader = ({ badgeKey, assetLabel, direction, t }) => (
  <div className="operating-trade-card__asset-row">
    <OperatingAssetTitleRow
      badgeKey={badgeKey}
      assetLabel={assetLabel}
      direction={direction}
      longLabel={t('operating.trade.long')}
      shortLabel={t('operating.trade.short')}
      badgeSize={ASSET_BADGE_SIZE_OPERATING}
    />
  </div>
);
