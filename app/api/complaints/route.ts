import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { createNotification } from "@/lib/notifications";
import { createComplaintSchema } from "@/lib/validations/complaint";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Zod Validation
    const validationResult = createComplaintSchema.safeParse(body);
    if (!validationResult.success) {
        return NextResponse.json(
            { error: "Validation Failed", details: validationResult.error.flatten() },
            { status: 400 }
        );
    }

    const {
        businessId,
        subject,
        description,
        category,
        contactName,
        contactPhone,
        attachments,
        orderId,
        bookingId
    } = validationResult.data;

    const complaintNumber = `CMP-${nanoid(8).toUpperCase()}`;

    const complaint = await prisma.complaint.create({
      data: {
        complaintNumber,
        businessId,
        userId,
        subject,
        description,
        category,
        contactName,
        contactPhone,
        attachments: attachments || [],
        orderId: orderId || null,
        bookingId: bookingId || null,
        status: "SUBMITTED",
        priority: "MEDIUM"
      }
    });

    // Notify Business Owner
    // Use Promise.all/race not strictly needed here as we want to ensure notification logic triggers but don't want to block response too long?
    // standard await is fine.

    const businessOwner = await prisma.business.findUnique({
        where: { id: businessId },
        select: { ownerId: true, name: true }
    });

    if (businessOwner?.ownerId) {
        await createNotification({
            userId: businessOwner.ownerId,
            title: `New Complaint: ${category}`,
            message: `A new complaint (${complaintNumber}) has been filed for ${businessOwner.name}.`,
            type: "SYSTEM_ALERT",
            link: `/business/dashboard?tab=complaints`
        });
    }

    return NextResponse.json(complaint, { status: 201 });

  } catch (error) {
    console.error("[Create Complaint Error]:", error);
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const businessId = searchParams.get("businessId");
      const filter = searchParams.get("filter"); // 'my_complaints' or 'business_complaints'
      const status = searchParams.get("status");

      let whereClause: any = {};

      if (filter === "business_complaints") {
          // If businessId is provided, verify ownership or role
          if (!businessId) {
              return NextResponse.json({ error: "Business ID required" }, { status: 400 });
          }

          // Verify user owns the business (Security Check)
          const business = await prisma.business.findUnique({
              where: { id: businessId },
              select: { ownerId: true }
          });

          if (business?.ownerId !== userId) {
            return NextResponse.json({ error: "Unauthorized access to business complaints" }, { status: 403 });
          }

          whereClause = { businessId };
      } else {
          // Default: Fetch my complaints as a customer
          whereClause = { userId };
      }

      // Add status filter if present
       if (status && status !== "ALL") {
          whereClause.status = status;
       }

      const complaints = await prisma.complaint.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
            business: {
                select: { name: true, slug: true, logo: true }
            },
            user: {
                select: { firstName: true, lastName: true, avatar: true, email: true }
            }
        }
      });

      return NextResponse.json(complaints);

    } catch (error) {
      console.error("[Fetch Complaints Error]:", error);
      return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
    }
}
