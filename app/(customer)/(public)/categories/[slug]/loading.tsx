// app/categories/[slug]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function DiscoveryLoadingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <section className="border-b border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container-padding section-spacing-tight mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
        </div>
      </section>

      {/* Filters Skeleton */}
      <section className="border-b border-border/50 bg-muted/30">
        <div className="container-padding py-4 mx-auto max-w-7xl">
          <div className="flex gap-4">
            <Skeleton className="h-32 flex-1 rounded-lg" />
            <Skeleton className="h-32 flex-1 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className="section-spacing">
        <div className="container-padding mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-border/50 bg-card">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
