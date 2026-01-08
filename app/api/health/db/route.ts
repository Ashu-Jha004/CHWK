
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Try a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", message: "Database connected successfully" });
  } catch (error: any) {
    console.error("Health Check DB Error:", error);
    return NextResponse.json({
      status: "error",
      message: error.message,
      stack: error.stack,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL
      }
    }, { status: 500 });
  }
}
