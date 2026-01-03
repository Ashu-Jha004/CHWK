"use server";

import { performSearch } from "@/lib/search/server";
import { z } from "zod";
import { headers } from "next/headers";

/**
 * 1. SCHEMA VALIDATION
 */
const SearchParamsSchema = z.object({
  query: z.string().min(2).max(100).trim(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(),
  city: z.string().optional(),
  categoryId: z.string().optional(),
  isVerified: z.boolean().optional(),
  minRating: z.number().optional(),
  priceRange: z.array(z.string()).optional(),
  limit: z.number().int().positive().min(1).max(50).default(12),
  page: z.number().int().positive().default(1),
});

/**
 * 2. TYPES
 */
export type SearchActionResponse =
  | { success: true; data: any }
  | { success: false; error: string; code: string; details?: any };

/**
 * 3. RATE LIMITING (Next.js 15 Async Fix)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 45;

async function checkRateLimit(): Promise<{ allowed: boolean }> {
  const headersList = await headers(); // MUST BE AWAITED in Next.js 15
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "anonymous";
  const key = `search:${ip}`;

  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) return { allowed: false };

  record.count++;
  return { allowed: true };
}

/**
 * 4. CIRCUIT BREAKER
 */
class CircuitBreaker {
  private failureCount = 0;
  private state: "CLOSED" | "OPEN" = "CLOSED";
  private lastFailureTime = 0;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > 30000) this.state = "CLOSED";
      else throw new Error("Circuit breaker is OPEN");
    }
    try {
      const result = await fn();
      this.failureCount = 0;
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      if (this.failureCount >= 5) this.state = "OPEN";
      throw error;
    }
  }
  getState() { return this.state; }
}

const searchCircuitBreaker = new CircuitBreaker();

/**
 * 5. THE ACTION
 */
export async function searchBusinessesAction(params: any): Promise<SearchActionResponse> {
  const startTime = Date.now();

  try {
    // A. Rate Limit
    const rateLimit = await checkRateLimit();
    if (!rateLimit.allowed) {
      return { success: false, error: "Too many requests", code: "RATE_LIMIT" };
    }

    // B. Validate
    const validated = SearchParamsSchema.safeParse(params);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
        code: "VALIDATION_ERROR"
      };
    }

    // C. Circuit Breaker & Timeout
    const results = await Promise.race([
      searchCircuitBreaker.execute(() => performSearch({
        query: validated.data.query,
        location: validated.data.location,
        latitude: validated.data.latitude,
        longitude: validated.data.longitude,
        radius: validated.data.radius,
        page: validated.data.page,
        limit: validated.data.limit,
        categorySlug: validated.data.categoryId,
        isVerified: validated.data.isVerified,
        minRating: validated.data.minRating,
        priceRange: validated.data.priceRange as any,
      })),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Search Timeout")), 5000)
      )
    ]);

    return { success: true, data: results };

  } catch (error: any) {
    console.error("[Search Action Error]:", error.message);

    return {
      success: false,
      error: error.message === "Search Timeout" ? "Search took too long" : "Service unavailable",
      code: error.message === "Search Timeout" ? "TIMEOUT" : "DATABASE_ERROR"
    };
  }
}