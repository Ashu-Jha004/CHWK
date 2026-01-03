import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createNotification } from "@/lib/notifications";
import { updateComplaintSchema } from "@/lib/validations/complaint";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Zod Validation
    const validationResult = updateComplaintSchema.safeParse(body);
    if (!validationResult.success) {
         return NextResponse.json(
            { error: "Validation Failed", details: validationResult.error.flatten() },
            { status: 400 }
        );
    }

    const { status, resolution, adminNotes, priority, assignedToId } = validationResult.data;

    // Fetch existing complaint to verify ownership/access
    const complaint = await prisma.complaint.findUnique({
        where: { id },
        include: { business: true }
    });

    if (!complaint) return NextResponse.json({ error: "Complaint not found" }, { status: 404 });

    // Scenario 1: Business Owner updating Status/Resolution
    if (complaint.business.ownerId === userId) {
        const updateData: any = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (adminNotes) updateData.adminNotes = adminNotes;
        if (assignedToId) {
            updateData.assignedToId = assignedToId;
            updateData.assignedAt = new Date();
        }
        if (resolution) {
            updateData.resolution = resolution;
            if (status === 'RESOLVED') updateData.resolvedAt = new Date();
        }

        const updatedComplaint = await prisma.complaint.update({
            where: { id },
            data: updateData
        });

        // Trigger Notification for User if Status Changed
        if (status && status !== complaint.status) {
             await createNotification({
                userId: complaint.userId,
                title: `Complaint Update: ${complaint.complaintNumber}`,
                message: `Your complaint status has been updated to ${status}.`,
                type: "COMPLAINT_UPDATE",
                link: `/profile/complaints`
             });
        }

        return NextResponse.json(updatedComplaint);
    }

    // Scenario 2: User updating content (only if SUBMITTED/UNDER_REVIEW)
    // Future Scope: Allow users to edit their complaint description if it hasn't been processed yet.

    return NextResponse.json({ error: "Unauthorized to update this complaint" }, { status: 403 });

  } catch (error) {
    console.error("[Update Complaint Error]:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const complaint = await prisma.complaint.findUnique({
          where: { id },
          include: { business: true }
      });

      if (!complaint) return NextResponse.json({ error: "Complaint not found" }, { status: 404 });

      // Only Creator can delete and ONLY if SUBMITTED (not yet processed)
      if (complaint.userId === userId) {
          if (complaint.status !== 'SUBMITTED') {
              return NextResponse.json({ error: "Cannot delete processed complaint" }, { status: 400 });
          }

          await prisma.complaint.delete({ where: { id } });
          return NextResponse.json({ message: "Complaint deleted" });
      }

      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    } catch (error) {
      console.error("[Delete Complaint Error]:", error);
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
  }
