
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 1. Try to enable extensions
    try {
        await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
        await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;`);
    } catch(e) {
        return NextResponse.json({ error: "Failed to create extensions", details: String(e) }, { status: 500 });
    }

    // 2. Test similarity
    try {
        const result = await prisma.$queryRaw`SELECT similarity('abc', 'abd') as score`;
        const score = Number((result as any)[0].score);

        // 3. Test category search
        const cats = await prisma.$queryRaw`SELECT name, "isActive" FROM categories WHERE "isActive" = true LIMIT 5`;

        return NextResponse.json({ success: true, score, cats });
    } catch(e) {
         return NextResponse.json({ error: "Query failed", details: String(e) }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
