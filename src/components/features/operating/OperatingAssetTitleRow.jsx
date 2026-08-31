import { AssetBadge } from '../../ui/AssetBadge';
import { OperatingDirectionBadge } from '../../ui/OperatingDirectionBadge';

export const OperatingAssetTitleRow = ({
  badgeKey,
  assetLabel,
  direction,
  longLabel,
  shortLabel,
  badgeSize,
  nameClassName = 'operating-asset-title-row__name',
}) => {
  const hasDirection = direction === 'LONG' || direction === 'SHORT';

  return (
    <div className="operating-asset-title-row">
      {badgeKey ? <AssetBadge asset={badgeKey} size={badgeSize} className="shrink-0" /> : null}
      {assetLabel ? (
        <>
          {badgeKey ? (
            <span className="operating-asset-title-row__sep" aria-hidden>
              ·
            </span>
          ) : null}
          <span className={nameClassName}>{assetLabel}</span>
        </>
      ) : null}
      {hasDirection ? (
        <>
          {badgeKey || assetLabel ? (
            <span className="operating-asset-title-row__sep" aria-hidden>
              ·
            </span>
          ) : null}
          <OperatingDirectionBadge
            direction={direction}
            longLabel={longLabel}
            shortLabel={shortLabel}
          />
        </>
      ) : null}
    </div>
  );
};
