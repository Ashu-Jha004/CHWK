// app/categories/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading state for categories page
 * Shows while page is being generated or data is being fetched
 */
export default function CategoriesLoadingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="border-b border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container-padding section-spacing-tight mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-64 md:h-16 md:w-96" />
            <Skeleton className="h-6 w-80 md:w-[500px]" />
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className="section-spacing">
        <div className="container-padding mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/50 bg-card p-6"
              >
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
