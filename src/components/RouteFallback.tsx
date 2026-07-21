const RouteFallback = () => (
  <div className="min-h-screen bg-background" aria-busy="true" aria-live="polite">
    {/* Header placeholder */}
    <div className="h-20 md:h-24 border-b border-border/40 bg-background" />
    {/* Hero skeleton */}
    <div className="container-luxury pt-12 md:pt-20 pb-10">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="h-3 w-28 mx-auto bg-muted animate-pulse rounded" />
        <div className="h-10 md:h-14 w-3/4 mx-auto bg-muted animate-pulse rounded" />
        <div className="h-10 md:h-14 w-1/2 mx-auto bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 mx-auto bg-muted/70 animate-pulse rounded mt-6" />
      </div>
    </div>
    {/* Grid skeleton */}
    <div className="container-luxury pb-20">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-sm overflow-hidden shadow-soft">
            <div className="aspect-[4/5] bg-muted animate-pulse" />
            <div className="p-6 space-y-3">
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
    <span className="sr-only">טוען תוכן…</span>
  </div>
);

export default RouteFallback;
