// hooks/use-infinite-businesses.ts
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  distance: number;
  location: {
    city: string;
    state: string;
    area: string | null;
  };
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
  quickStats: {
    is24x7: boolean;
    hasEmergencyService: boolean;
    acceptsBookings: boolean;
    acceptsOrders: boolean;
  };
  priceRange: string | null;
  media: Array<{
    id: string;
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
    type: string;
    width: number | null;
    height: number | null;
    displayOrder: number | null;
    isFeatured: boolean;
  }>;
}

interface BusinessResponse {
  success: boolean;
  data: Business[];
  pagination: {
    page: number;
    limit: number;
    totalResults: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Fetch businesses from API
 */
async function fetchBusinesses(
  slug: string,
  lat: number,
  lng: number,
  radius: number,
  page: number,
  sort: string
): Promise<BusinessResponse> {
  const response = await fetch(
    `/api/category/${slug}/businesses?lat=${lat}&lng=${lng}&radius=${radius}&page=${page}&limit=20&sort=${sort}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch businesses');
  }

  return response.json();
}

/**
 * Custom hook for infinite scroll businesses
 */
export function useInfiniteBusinesses(
  categorySlug: string,
  latitude: number | undefined,
  longitude: number | undefined,
  radius: number,
  sortBy: 'distance' | 'rating' | 'reviews' = 'distance'
) {
  return useInfiniteQuery({
    queryKey: ['infinite-businesses', categorySlug, latitude, longitude, radius, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      fetchBusinesses(categorySlug, latitude!, longitude!, radius, pageParam, sortBy),
    getNextPageParam: (lastPage) => {
      // Return next page number if there are more pages
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined; // No more pages
    },
    initialPageParam: 1,
    enabled: !!latitude && !!longitude, // Only fetch when location is available
    staleTime: 10 * 60 * 1000, // 10 minutes (Increased stability)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });
}
