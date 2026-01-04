import { NextRequest, NextResponse } from "next/server";
import { verifyBusinessAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;

    // 1. Verify Access
    const access = await verifyBusinessAccess(businessId);
    if (!access.success) {
      return NextResponse.json(
        { error: access.message || "Unauthorized" },
        { status: 403 }
      );
    }

    // 2. Fetch Orders
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const whereClause: any = {
      businessId,
    };

    if (date) {
      const targetDate = new Date(date);
      if (!isNaN(targetDate.getTime())) {
          whereClause.createdAt = {
              gte: new Date(targetDate.setHours(0,0,0,0)),
              lt: new Date(targetDate.setHours(23,59,59,999))
          };
      }
    }

    if (status && status !== "ALL") {
        whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    return NextResponse.json({ orders });

  } catch (error) {
    console.error("[API] Fetch Business Orders Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
