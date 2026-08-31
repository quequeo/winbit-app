import { Spinner } from './Spinner';
import { SkeletonCard, SkeletonListItem } from './skeleton/SkeletonCard';
import { Skeleton } from './skeleton/Skeleton';

export const PageLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Spinner size="lg" />
  </div>
);

export const HistoryListSkeleton = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }, (_, i) => (
      <SkeletonListItem key={i} />
    ))}
  </div>
);

export const FormSkeleton = () => (
  <SkeletonCard>
    <Skeleton className="h-5 w-40 mb-6" />
    <Skeleton className="h-12 w-full mb-4" />
    <Skeleton className="h-12 w-full mb-4" />
    <Skeleton className="h-24 w-full mb-4" />
    <Skeleton className="h-14 w-full rounded-[18px]" />
  </SkeletonCard>
);
