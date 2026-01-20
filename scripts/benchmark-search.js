
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Polyfill for distance calculation formula since we are running raw query outside of the service context
// Actually, we can just call the service functions if we can import them.
// But importing TS modules in a JS script without proper setup is hard.
// So I will replicate the implementation logic in this script to verify the DB performance specifically.
// This isolates the DB query performance from the Next.js overhead.

async function benchmark() {
  console.log('Starting Benchmark...');

  try {
    // 1. Benchmark matchCategories logic
    const query = "restaurants";
    const startMatch = performance.now();

    // logic from optimized matchCategories
    const normalizedQuery = query.toLowerCase().trim();
    const categories = await prisma.$queryRaw`
      SELECT
        id,
        slug,
        name,
        GREATEST(
          similarity(name, ${normalizedQuery}),
          (
            SELECT MAX(similarity(keyword, ${normalizedQuery}))
            FROM unnest("searchKeywords") as keyword
          )
        ) as similarity
      FROM categories
      WHERE
        "isActive" = true
        AND (
          similarity(name, ${normalizedQuery}) > 0.3
          OR EXISTS (
            SELECT 1
            FROM unnest("searchKeywords") as keyword
            WHERE similarity(keyword, ${normalizedQuery}) > 0.3
          )
        )
      ORDER BY similarity DESC
      LIMIT 5
    `;

    const endMatch = performance.now();
    console.log(`[matchCategories] Query: "${query}" | Matches: ${categories.length} | Time: ${(endMatch - startMatch).toFixed(2)}ms`);

    // 2. Benchmark searchWithDistance logic (lightweight first pass)
    const userLat = 12.9716; // Bangalore
    const userLon = 77.5946;
    const radiusKm = 10;

    const startSearch = performance.now();

    const latDelta = radiusKm / 111.32;
    const lonDelta = radiusKm / (111.32 * Math.cos(userLat * (Math.PI / 180)));
    const minLat = userLat - latDelta;
    const maxLat = userLat + latDelta;
    const minLon = userLon - lonDelta;
    const maxLon = userLon + lonDelta;

    const distanceFormula = `
      (6371 * acos(
        cos(radians(${userLat})) *
        cos(radians(latitude)) *
        cos(radians(longitude) - radians(${userLon})) +
        sin(radians(${userLat})) *
        sin(radians(latitude))
      ))
    `;

    const lightweightResults = await prisma.$queryRawUnsafe(`
      SELECT
        id,
        "averageRating",
        "totalReviews",
        "isVerified",
        ${distanceFormula} as distance
      FROM businesses
      WHERE
        latitude BETWEEN ${minLat} AND ${maxLat}
        AND longitude BETWEEN ${minLon} AND ${maxLon}
        AND ${distanceFormula} <= ${radiusKm}
        AND status IN ('ACTIVE', 'CLAIMED')
        AND "deletedAt" IS NULL
      ORDER BY distance ASC
      LIMIT 200
    `); // using unsafe to inject the formula string directly

    const midSearch = performance.now();

    // Simulate pagination fetch
    if (lightweightResults.length > 0) {
        const targetIds = lightweightResults.slice(0, 12).map(b => b.id);
        const fullDetails = await prisma.business.findMany({
            where: { id: { in: targetIds } },
            select: { id: true, name: true } // partial select for benchmark
        });
    }

    const endSearch = performance.now();
    console.log(`[searchWithDistance] Count: ${lightweightResults.length} | FirstPass: ${(midSearch - startSearch).toFixed(2)}ms | Total: ${(endSearch - startSearch).toFixed(2)}ms`);

  } catch (e) {
    console.error("Benchmark failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

benchmark();
