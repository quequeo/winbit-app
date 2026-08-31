import { ChevronRight, LineChart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OperatingAssetTitleRow } from '../operating/OperatingAssetTitleRow';
import { OperatingDirectionBadge } from '../../ui/OperatingDirectionBadge';
import { EmptyState } from '../../ui/EmptyState';
import { formatDate } from '../../../utils/formatDate';
import { formatUsdSignedDisplay } from '../../../utils/formatUsdDisplay';
import { ASSET_BADGE_SIZE_DASHBOARD, toAssetBadgeKey } from '../../../utils/operatingTrade';

const OperationListItem = ({ row, hidden, t, onOpen }) => {
  const result = Number(row.resultUsd) || 0;
  const isPositive = result > 0;
  const resultClass = isPositive ? 'text-positive' : 'text-negative';
  const badgeKey = toAssetBadgeKey(row.asset ?? row.assetLabel ?? row.contract);

  return (
    <button
      type="button"
      className="dashboard-list-item dashboard-list-item--interactive"
      onClick={onOpen}
    >
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="min-w-0 text-left">
          <OperatingAssetTitleRow
            badgeKey={badgeKey}
            assetLabel={row.assetLabel}
            direction={row.direction}
            longLabel={t('dashboard.recentOperations.long')}
            shortLabel={t('dashboard.recentOperations.short')}
            badgeSize={ASSET_BADGE_SIZE_DASHBOARD}
            nameClassName="operating-asset-title-row__name operating-asset-title-row__name--dashboard"
          />
          <p className="text-[0.6875rem] text-text-muted mt-0.5">
            {formatDate(row.date, { time: false })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <p className={`text-[0.8125rem] font-bold tabular-nums font-display ${resultClass}`}>
            {hidden ? '••••••' : formatUsdSignedDisplay(result)}
          </p>
          <ChevronRight
            className="w-3.5 h-3.5 text-text-dim shrink-0"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
      </div>
    </button>
  );
};

export const DashboardOperationsTable = ({ operations, hidden }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const openDetail = (row) => {
    navigate('/operational', { state: { operatingRow: row.detailRow ?? row } });
  };

  return (
    <div className="winbit-card dashboard-panel-card">
      <div className="flex items-center justify-between mb-1">
        <h2 className="dashboard-section-title">{t('dashboard.recentOperations.title')}</h2>
        <Link to="/operational" className="text-xs font-semibold text-primary hover:underline">
          {t('dashboard.viewAll')}
        </Link>
      </div>

      {!operations?.length ? (
        <EmptyState
          icon={LineChart}
          title={t('dashboard.recentOperations.emptyTitle')}
          description={t('dashboard.recentOperations.emptyDescription')}
          className="dashboard-panel-empty"
        />
      ) : (
        <>
          <div className="md:hidden mt-3">
            {operations.map((row) => (
              <OperationListItem
                key={row.id}
                row={row}
                hidden={hidden}
                t={t}
                onOpen={() => openDetail(row)}
              />
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto mt-4">
            <table className="dashboard-table w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th className="pb-2 pr-3 font-medium">{t('dashboard.recentOperations.date')}</th>
                  <th className="pb-2 pr-3 font-medium">{t('dashboard.recentOperations.asset')}</th>
                  <th className="pb-2 pr-3 font-medium">
                    {t('dashboard.recentOperations.direction')}
                  </th>
                  <th className="pb-2 pr-3 font-medium text-right">
                    {t('dashboard.recentOperations.result')}
                  </th>
                  <th className="pb-2 w-8" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {operations.map((row) => {
                  const result = Number(row.resultUsd) || 0;
                  const isPositive = result > 0;

                  return (
                    <tr
                      key={row.id}
                      className="dashboard-table-row--interactive border-t border-[rgba(255,255,255,0.06)]"
                      onClick={() => openDetail(row)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openDetail(row);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                    >
                      <td className="py-3 pr-3 text-text-muted whitespace-nowrap">
                        {formatDate(row.date, { time: false })}
                      </td>
                      <td className="py-3 pr-3">
                        <OperatingAssetTitleRow
                          badgeKey={row.asset}
                          assetLabel={row.assetLabel}
                          direction={null}
                          longLabel={t('dashboard.recentOperations.long')}
                          shortLabel={t('dashboard.recentOperations.short')}
                          badgeSize={ASSET_BADGE_SIZE_DASHBOARD}
                          nameClassName="operating-asset-title-row__name operating-asset-title-row__name--dashboard"
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <OperatingDirectionBadge
                          direction={row.direction}
                          longLabel={t('dashboard.recentOperations.long')}
                          shortLabel={t('dashboard.recentOperations.short')}
                        />
                      </td>
                      <td
                        className={`py-3 pr-3 text-right font-bold tabular-nums whitespace-nowrap ${
                          isPositive ? 'text-positive' : 'text-negative'
                        }`}
                      >
                        {hidden ? '••••••' : formatUsdSignedDisplay(result)}
                      </td>
                      <td className="py-3 text-right">
                        <ChevronRight
                          className="w-4 h-4 text-text-dim inline-block"
                          strokeWidth={1.5}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
