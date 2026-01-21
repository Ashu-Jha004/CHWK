import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parallel fetch for dashboard stats
    const [business, complaintsBreakdown] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        select: {
          viewCount: true,
          totalReviews: true,
          averageRating: true,
          totalComplaints: true,
          form: true,
          formResponse: true,
        }
      }),
      prisma.complaint.groupBy({
        by: ['status'],
        where: { businessId },
        _count: {
          status: true
        }
      })
    ]);

    if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Process complaints stats
    const complaintStats = {
        total: business.totalComplaints,
        pending: 0,
        inProgress: 0,
        resolved: 0
    };

    complaintsBreakdown.forEach(stat => {
        if (stat.status === 'SUBMITTED' || stat.status === 'UNDER_REVIEW') {
            complaintStats.pending += stat._count.status;
        } else if (stat.status === 'IN_PROGRESS') {
            complaintStats.inProgress += stat._count.status;
        } else if (stat.status === 'RESOLVED') {
            complaintStats.resolved += stat._count.status;
        }
    });

    return NextResponse.json({
        views: business.viewCount,
        reviews: business.totalReviews,
        rating: business.averageRating,
        complaints: complaintStats,
        form: business.form,
        formResponse: business.formResponse
    });

  } catch (error) {
    console.error("[Dashboard Stats Error]:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
