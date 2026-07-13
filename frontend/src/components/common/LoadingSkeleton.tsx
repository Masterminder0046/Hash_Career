export const CardSkeleton = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="skeleton h-4 w-3/4"></div>
    <div className="skeleton h-8 w-1/2"></div>
    <div className="skeleton h-4 w-full"></div>
    <div className="skeleton h-4 w-2/3"></div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="glass-card p-6 space-y-4">
    <div className="skeleton h-10 w-full"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton h-12 w-full"></div>
    ))}
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="glass-card p-6 space-y-3">
        <div className="skeleton h-4 w-1/2"></div>
        <div className="skeleton h-8 w-1/3"></div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-6">
    <div className="skeleton h-64 w-full"></div>
  </div>
);
