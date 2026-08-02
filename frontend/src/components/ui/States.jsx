import { Skeleton } from './Skeleton';
import { FadeIn } from './Motion';

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
    {Icon && (
      <div className="h-16 w-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
    )}
    <h3 className="text-lg font-bold text-ink">{title}</h3>
    {description && <p className="text-sm text-muted mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const LoadingJobs = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const PageLoader = () => (
  <div className="flex items-center justify-center py-24">
    <div className="h-10 w-10 rounded-full border-4 border-line border-t-accent animate-spin" />
  </div>
);

export const FadeInContainer = FadeIn;
