import { NextRequest, NextResponse } from "next/server";
import { getCurrentBusiness, verifyBusinessAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15+ params
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

    // 2. Fetch Bookings
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    // const page = parseInt(searchParams.get("page") || "1");
    // const limit = parseInt(searchParams.get("limit") || "50");

    const whereClause: any = {
      businessId,
    };

    if (date) {
      // Filter by date (ignoring time)
      const targetDate = new Date(date);
      if (!isNaN(targetDate.getTime())) {
          whereClause.bookingDate = {
              gte: new Date(targetDate.setHours(0,0,0,0)),
              lt: new Date(targetDate.setHours(23,59,59,999))
          };
      }
    }

    if (status && status !== "ALL") {
        whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        bookingDate: 'asc' // Upcoming first
      },
      take: 100 // Safe limit for now
    });

    return NextResponse.json({ bookings });

  } catch (error) {
    console.error("[API] Fetch Business Bookings Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
