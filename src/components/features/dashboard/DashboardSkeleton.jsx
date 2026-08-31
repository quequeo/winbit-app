import {
  SkeletonCard,
  SkeletonChart,
  SkeletonListItem,
  SkeletonMetricCard,
} from '../../ui/skeleton/SkeletonCard';
import { Skeleton } from '../../ui/skeleton/Skeleton';

export const DashboardSkeleton = () => (
  <div className="dashboard-page" data-testid="dashboard-skeleton">
    <div className="dashboard-header">
      <Skeleton className="h-8 w-56 mb-2" />
      <Skeleton className="h-4 w-40 mb-4" />
      <div className="dashboard-status-bar">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full max-w-xs" />
        <Skeleton className="h-3 w-full max-w-xs" />
      </div>
    </div>

    <div className="dashboard-section">
      <SkeletonMetricCard />
      <SkeletonMetricCard />
    </div>

    <div className="dashboard-section dashboard-section--stack">
      <SkeletonCard>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-5 w-28" />
      </SkeletonCard>
      <SkeletonCard>
        <Skeleton className="h-4 w-28 mb-2" />
        <Skeleton className="h-3 w-20 mb-4" />
        <Skeleton className="h-5 w-28" />
      </SkeletonCard>
      <SkeletonCard>
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </SkeletonCard>
    </div>

    <SkeletonChart />

    <SkeletonCard>
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-12 w-full mb-2 rounded-xl" />
      <Skeleton className="h-12 w-full mb-2 rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </SkeletonCard>

    <SkeletonCard>
      <div className="flex justify-between mb-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-16" />
      </div>
      <SkeletonListItem />
      <SkeletonListItem />
      <SkeletonListItem />
    </SkeletonCard>
  </div>
);
