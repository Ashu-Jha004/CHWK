"use server";

import { prisma } from "@/lib/prisma";

export type Suggestion = {
  id: string;
  text: string;
  type: "category" | "business";
  slug: string;
  subText?: string;
};

export async function getSearchSuggestions(query: string): Promise<Suggestion[]> {
  if (!query || query.length < 2) return [];

  const cleanQuery = query.trim().toLowerCase();

  try {
    const [categories, businesses] = await Promise.all([
      // 1. Match Categories (Highest Priority)
      prisma.category.findMany({
        where: {
          name: { contains: cleanQuery, mode: "insensitive" },
          isActive: true,
        },
        select: { id: true, name: true, slug: true },
        take: 3,
      }),
      // 2. Match Business Names
      prisma.business.findMany({
        where: {
          name: { contains: cleanQuery, mode: "insensitive" },
          status: "ACTIVE",
        },
        select: { id: true, name: true, slug: true, city: true },
        take: 5,
      }),
    ]);

    const suggestions: Suggestion[] = [
      ...categories.map((c) => ({
        id: c.id,
        text: c.name,
        type: "category" as const,
        slug: c.slug,
        subText: "Category",
      })),
      ...businesses.map((b) => ({
        id: b.id,
        text: b.name,
        type: "business" as const,
        slug: b.slug,
        subText: b.city,
      })),
    ];

    return suggestions;
  } catch (error) {
    console.error("Autocomplete Error:", error);
    return [];
  }
}