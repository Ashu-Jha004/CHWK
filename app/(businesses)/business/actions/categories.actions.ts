/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions/categories.actions.ts
// Server actions for fetching categories

"use server";

import { prisma } from "@/lib/prisma";

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
 * Fetch all active categories with hierarchy
 */
export async function getActiveCategories(): Promise<CategoryOption[]> {
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
}

/**
 * Search categories by name
 */
export async function searchCategories(
  query: string
): Promise<CategoryOption[]> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            searchKeywords: {
              hasSome: [query.toLowerCase()],
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
      take: 10,
    });

    return categories as CategoryOption[];
  } catch (error) {
    console.error("[Categories] Error searching categories:", error);
    throw new Error("Failed to search categories");
  }
}
