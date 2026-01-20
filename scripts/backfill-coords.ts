import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Delay helper to respect API rate limits (Nominatim requires 1 req/sec)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getCoordinates(query: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MyLocalServiceApp/1.0 (dev@example.com)", // Required by Nominatim
      },
    });

    if (!response.ok) {
        console.error(`Status: ${response.status}`);
        return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
}

async function main() {
  console.log("Starting coordinate backfill...");

  // 1. Fetch businesses.
  // We assume valid coordinates are non-zero. 0,0 is in the ocean.
  // Schema says Float, so checking for 0 is a safe proxy for "not set" if defaults were used,
  // or simple null checks if Prisma supports it (it handles null return types even if schema is strict in some versions).
  // Safest is to fetch all and check manually or valid candidates.
  // Actually, let's fetch those that are likely missing data.
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      addressLine1: true,
      city: true,
      state: true,
      pincode: true,
      latitude: true,
      longitude: true,
    },
  });

  console.log(`Found ${businesses.length} total businesses.`);

  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const business of businesses) {
    // Check if coordinates are effectively missing (e.g. 0,0 or null if types allowed)
    // We treat (0,0) or really small numbers as missing/default
    if (Math.abs(business.latitude) > 0.1 || Math.abs(business.longitude) > 0.1) {
      // console.log(`Skipping ${business.name} (Has coordinates)`);
      continue;
    }

    console.log(`Backfilling ${business.name}...`);

    // Construct address query
    const addressParts = [
      business.addressLine1,
      business.city,
      business.state,
      business.pincode
    ].filter(Boolean);

    const query = addressParts.join(", ");

    const coords = await getCoordinates(query);

    if (coords) {
      console.log(`  -> Found: ${coords.lat}, ${coords.lon}`);

      await prisma.business.update({
        where: { id: business.id },
        data: {
          latitude: coords.lat,
          longitude: coords.lon,
        },
      });
      updatedCount++;
    } else {
        // Fallback: Try just City + Pincode if full address fails
        console.log("  -> Full address failed, trying City + Pincode...");
        const simpleQuery = [business.city, business.pincode].filter(Boolean).join(", ");
        const simpleCoords = await getCoordinates(simpleQuery);

        if (simpleCoords) {
             console.log(`  -> Found (Approx): ${simpleCoords.lat}, ${simpleCoords.lon}`);
             await prisma.business.update({
                where: { id: business.id },
                data: {
                  latitude: simpleCoords.lat,
                  longitude: simpleCoords.lon,
                },
              });
             updatedCount++;
        } else {
            console.log("  -> Failed to resolve location.");
            failedCount++;
        }
    }

    // Rate limiting
    await delay(1200);
  }

  console.log("\nBackfill Complete!");
  console.log(`Updated: ${updatedCount}`);
  console.log(`Failed: ${failedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
