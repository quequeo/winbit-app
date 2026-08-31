import { Skeleton } from './Skeleton';

export const SkeletonCard = ({ children, className = '' }) => (
  <div className={`winbit-card wb-skeleton-card ${className}`}>{children}</div>
);

export const SkeletonMetricCard = () => (
  <SkeletonCard>
    <Skeleton className="h-3.5 w-36 mb-4" />
    <Skeleton className="h-10 w-48 mb-3" />
    <Skeleton className="h-3 w-40" />
  </SkeletonCard>
);

export const SkeletonChart = () => (
  <SkeletonCard>
    <div className="flex items-center justify-between mb-5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-56 rounded-full" />
    </div>
    <Skeleton className="h-48 w-full rounded-xl" />
    <Skeleton className="h-3 w-56 mx-auto mt-4" />
  </SkeletonCard>
);

export const SkeletonListItem = () => (
  <div className="dashboard-list-item">
    <div className="flex justify-between gap-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-4 w-full mt-3" />
    <Skeleton className="h-3 w-16 mt-2" />
  </div>
);

export const SkeletonButton = ({ className = '' }) => (
  <Skeleton className={`h-14 w-full rounded-[18px] ${className}`} />
);
