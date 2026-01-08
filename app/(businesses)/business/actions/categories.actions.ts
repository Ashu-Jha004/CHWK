/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions/categories.actions.ts
// Server actions for fetching categories with performance caching

"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  parentId: string | null;
  children: CategoryOption[];
}

/**
 * Fetch all active categories with hierarchy (Cached for 1 hour)
 */
export const getActiveCategories = unstable_cache(
  async (): Promise<CategoryOption[]> => {
    try {
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
          parentId: null, // Only get top-level categories
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          description: true,
          parentId: true,
          displayOrder: true,
          children: {
            where: {
              isActive: true,
            },
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              description: true,
              parentId: true,
            },
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
        orderBy: {
          displayOrder: "asc",
        },
      });

      return categories as any;
    } catch (error) {
      console.error("[Categories] Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  },
  ["active-categories-hierarchy"],
  { revalidate: 3600, tags: ["categories"] }
);

/**
 * Search categories by name (Not cached as it depends on user input)
 */
export async function searchCategories(
  query: string
): Promise<CategoryOption[]> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cleanQuery = query.trim().toLowerCase();

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: cleanQuery,
              mode: "insensitive",
            },
          },
          {
            searchKeywords: {
              hasSome: [cleanQuery],
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
        parentId: true,
      },
      take: 20, // Increased limit for better selection
      orderBy: {
        name: "asc",
      },
    });

    return categories as CategoryOption[];
  } catch (error) {
    console.error("[Categories] Error searching categories:", error);
    throw new Error("Failed to search categories");
  }
}
