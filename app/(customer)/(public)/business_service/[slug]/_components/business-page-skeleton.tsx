// app/business_service/[slug]/_components/business-page-skeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function BusinessPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card">
        <div className="container-padding py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </div>

      <div className="container-padding py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </aside>

          {/* Main Content Skeleton */}
          <main className="space-y-6">
            {/* Hero Section */}
            <Card className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex items-center gap-4 pt-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
                <Skeleton className="h-20 w-20 rounded-lg" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </Card>

            {/* Image Gallery Skeleton */}
            <Card className="p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="aspect-square rounded-lg" />
              </div>
            </Card>

            {/* Tabs Skeleton */}
            <Card className="p-6 space-y-6">
              {/* Tab Headers */}
              <div className="flex gap-4 border-b border-border pb-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-32 w-full mt-6" />
              </div>
            </Card>

            {/* Reviews Skeleton */}
            <Card className="p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-4 border border-border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Nav Skeleton */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="flex justify-around">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </div>
  );
}
