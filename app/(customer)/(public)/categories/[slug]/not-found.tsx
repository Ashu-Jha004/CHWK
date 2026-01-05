// app/categories/[slug]/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CategoryNotFound() {
  return (
    <main className="min-h-screen bg-background">
      <section className="section-spacing">
        <div className="container-padding mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-6xl">
            🔍
          </div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Category Not Found
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The category you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="btn-shine">
              <Link href="/categories">Browse All Categories</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
