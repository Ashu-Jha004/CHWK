import { NextRequest, NextResponse } from "next/server";
import { verifyBusinessAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createNotification } from "@/lib/notifications";

const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "CANCELLED_BY_BUSINESS", "CANCELLED_BY_USER", "COMPLETED"]),
  businessNotes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const { id: businessId, bookingId } = await params;

    // 1. Verify Access
    const access = await verifyBusinessAccess(businessId);
    if (!access.success) {
      return NextResponse.json(
        { error: access.message || "Unauthorized" },
        { status: 403 }
      );
    }

    // 2. Validate Body
    const body = await request.json();
    const validation = updateBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { status, businessNotes } = validation.data;

    // 3. Check if booking exists and belongs to business
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking || existingBooking.businessId !== businessId) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 4. Update Booking
    // Map informal "CANCELLED" to schema-appropriate "CANCELLED_BY_BUSINESS"
    let finalStatus = status;
    if (status === "CANCELLED") {
      finalStatus = "CANCELLED_BY_BUSINESS";
    }

    const updateData: any = {
      status: finalStatus,
      businessNotes: businessNotes !== undefined ? businessNotes : existingBooking.businessNotes,
    };

    // Auto-set timestamps based on status
    if (status === "CONFIRMED" && !existingBooking.confirmedAt) {
      updateData.confirmedAt = new Date();
    } else if (status === "COMPLETED" && !existingBooking.completedAt) {
      updateData.completedAt = new Date();
    } else if ((status === "CANCELLED" || status === "CANCELLED_BY_BUSINESS" || status === "CANCELLED_BY_USER") && !existingBooking.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    });

    // 5. Trigger Notification
    if (finalStatus !== existingBooking.status) {
      await createNotification({
        userId: existingBooking.userId,
        title: `Booking Update: ${finalStatus.replace(/_/g, " ")}`,
        message: `Your booking #${existingBooking.bookingNumber} has been updated to ${finalStatus.toLowerCase().replace(/_/g, " ")}.`,
        type: "BOOKING_UPDATE",
        link: `/customer/bookings`, // Link to user's bookings page
      });
    }

    return NextResponse.json({ success: true, booking: updatedBooking });

  } catch (error) {
    console.error("[API] Update Booking Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
