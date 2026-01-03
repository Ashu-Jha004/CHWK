import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;
    const { userId } = await auth();

    // Get IP address for simple deduplication
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Check if recorded recently (last 24h) for this IP
    const existingView = await prisma.businessView.findFirst({
      where: {
        businessId,
        ipAddress: ip,
        visitedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    if (existingView) {
      return NextResponse.json({ message: "View already recorded" }, { status: 200 });
    }

    // Record new view
    await prisma.$transaction([
      prisma.businessView.create({
        data: {
          businessId,
          userId,
          ipAddress: ip,
        }
      }),
      prisma.business.update({
        where: { id: businessId },
        data: {
          viewCount: { increment: 1 }
        }
      })
    ]);

    return NextResponse.json({ message: "View recorded" }, { status: 201 });

  } catch (error) {
    console.error("[View Track Error]:", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
