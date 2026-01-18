
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import { Header } from '@/components/LandingPage/layout/header';
import { TIER_1_CITIES } from '@/lib/(landing_page)/constants';

export const revalidate = 3600; // 1 hour

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Helper to normalize city names from slug
 * e.g. "new-delhi" -> "New Delhi"
 */
function unslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate Metadata for City Page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cityName = unslugify(slug);

  return {
    title: `Best Businesses & Services in ${cityName} | CHWK`,
    description: `Find top-rated restaurants, plumbers, doctors, and more in ${cityName}. Compare reviews, ratings, and reliable local services on CHWK.`,
    keywords: [`${cityName} businesses`, `services in ${cityName}`, `best restaurants ${cityName}`, `local guide ${cityName}`, 'CHWK'],
    openGraph: {
      title: `Best Local Services in ${cityName} | CHWK`,
      description: `Explore trusted local businesses in ${cityName}. verified ratings, photos, and contact info.`,
      type: 'website',
      url: `/city/${slug}`,
    },
    alternates: {
      canonical: `/city/${slug}`,
    }
  };
}

/**
 * Generate Static Params for known cities
 */
export function generateStaticParams() {
   return TIER_1_CITIES.map(city => ({
     slug: city.toLowerCase().replace(/\s+/g, '-'),
   }));
}

export default async function CityPage({ params }: PageProps) {
  const { slug } = await params;
  const cityName = unslugify(slug);

  // Fetch businesses for this city
  // Note: Database storage for city might differ from slug (e.g. "Mumbai" vs "mumbai")
  // We'll try a case-insensitive match if possible, or just exact match on the unslugified name
  const businesses = await prisma.business.findMany({
    where: {
      city: {
        equals: cityName,
        mode: 'insensitive', // PostgreSQL specific, but usually supported in Prisma for Postgres
      },
      status: 'ACTIVE',
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      coverImage: true,
      averageRating: true,
      totalReviews: true,
      addressLine1: true,
      categories: {
        take: 1,
        include: {
          category: true,
        },
      },
      images: {
        take: 1,
        where: { isFeatured: true },
      }
    },
    take: 50, // Top 50 businesses in the city
    orderBy: [
      { averageRating: 'desc' },
      { totalReviews: 'desc' },
    ],
  });

  if (!businesses || businesses.length === 0) {
    // Optionally return notFound() if we want strict 404s,
    // but for SEO it might be better to show an empty state "Coming Soon" page
    // For now, let's allow it but show a message.
    // But if the sitemap links here, it implies content exists.
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      <Header />

      {/* City Hero */}
      <section className="relative bg-muted/30 border-b border-border/40 pt-12 pb-16">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Explore <span className="text-primary">{cityName}</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover {businesses.length > 0 ? businesses.length : 'various'} of the best local businesses, services, and hidden gems in {cityName}.
            </p>
          </div>
        </div>
      </section>

      {/* Business Grid */}
      <section className="container-padding max-w-7xl mx-auto py-12">
        {businesses.length === 0 ? (
           <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed border-border">
             <h2 className="text-2xl font-bold mb-2">No businesses found in {cityName} yet</h2>
             <p className="text-muted-foreground">We are currently expanding to this region. Check back soon!</p>
             <Button asChild className="mt-6" variant="outline">
               <Link href="/categories">Browse Categories</Link>
             </Button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => {
               // Fallback image logic
               const displayImage = business.images?.[0]?.imageUrl || business.coverImage || business.logo || "/placeholder-business.jpg";
               const categoryName = business.categories?.[0]?.category?.name || "Local Business";

               return (
                <Link key={business.id} href={`/business_service/${business.slug}`} className="group">
                  <Card className="h-full overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
                    {/* Image */}
                    <div className="relative h-48 w-full bg-muted overflow-hidden">
                      <Image
                        src={displayImage}
                        alt={business.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                         <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground shadow-sm">
                           {categoryName}
                         </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {business.name}
                      </h2>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center bg-primary/10 px-2 py-0.5 rounded text-sm font-semibold text-primary">
                         10
                        </div>
                        <span className="text-sm text-muted-foreground">({business.totalReviews} reviews)</span>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{business.addressLine1 || cityName}</span>
                      </div>

                      <div className="flex items-center text-sm font-medium text-primary uppercase tracking-wide">
                        View Details <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
               );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
