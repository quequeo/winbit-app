import { getAssetDisplayName, normalizeAsset, toAssetBadgeKey } from '../../utils/operatingTrade';

const ASSET_CONFIG = {
  DOWJONES: { src: '/images/operating-assets/dow-jones.png' },
  NASDAQ: { src: '/images/operating-assets/nasdaq.png' },
  BTC: { src: '/images/operating-assets/btc.png' },
  SP500: { src: '/images/operating-assets/sp500.png' },
};

const resolveBadgeKey = (asset) => {
  if (typeof asset === 'string' && ASSET_CONFIG[asset]) return asset;
  return toAssetBadgeKey(asset) ?? normalizeAsset(asset);
};

export const AssetBadge = ({ asset, size = 46, className = '' }) => {
  const badgeKey = resolveBadgeKey(asset);
  const config = badgeKey ? ASSET_CONFIG[badgeKey] : null;
  const label = badgeKey ? getAssetDisplayName(badgeKey) : null;

  if (!config || !label) return null;

  return (
    <div
      className={`asset-badge asset-badge--circle ${className}`.trim()}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      aria-label={label}
      title={label}
    >
      <img src={config.src} alt="" loading="lazy" decoding="async" />
    </div>
  );
};
