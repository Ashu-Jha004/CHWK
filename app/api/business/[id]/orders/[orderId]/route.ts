import { NextRequest, NextResponse } from "next/server";
import { verifyBusinessAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createNotification } from "@/lib/notifications";

const updateOrderSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED"
  ]).optional(),
  businessNotes: z.string().optional(),
  estimatedPrepTime: z.number().optional(),
  total: z.number().optional(), // Owners might set the price for custom orders
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> }
) {
  try {
    const { id: businessId, orderId } = await params;

    // 1. Verify Access
    const access = await verifyBusinessAccess(businessId);
    if (!access.success) {
      return NextResponse.json(
        { error: access.message || "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid update data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // 2. Fetch existing order to check status change
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder || existingOrder.businessId !== businessId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 3. Update Order
    const order = await prisma.order.update({
      where: {
        id: orderId,
        businessId: businessId, // Ensure order belongs to this business
      },
      data: {
        ...updateData,
        // Track timestamps for status changes
        ...(updateData.status === "CONFIRMED" ? { acceptedAt: new Date() } : {}),
        ...(updateData.status === "PREPARING" ? { preparingAt: new Date() } : {}),
        ...(updateData.status === "READY_FOR_PICKUP" ? { readyAt: new Date() } : {}),
        ...(updateData.status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
        ...(updateData.status === "CANCELLED" ? { cancelledAt: new Date(), cancelledBy: "BUSINESS" } : {}),
      },
    });

    // 4. Trigger Notification
    if (updateData.status && updateData.status !== existingOrder.status) {
      await createNotification({
        userId: existingOrder.userId,
        title: `Order Update: ${updateData.status.replace(/_/g, " ")}`,
        message: `Your order #${existingOrder.orderNumber} is now ${updateData.status.toLowerCase().replace(/_/g, " ")}.`,
        type: "ORDER_UPDATE",
        link: `/customer/orders`, // Link to user's orders page
      });
    }

    return NextResponse.json({ success: true, order });

  } catch (error) {
    console.error("[API] Update Order Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> }
) {
  try {
    const { id: businessId, orderId } = await params;

    // 1. Verify Access
    const access = await verifyBusinessAccess(businessId);
    if (!access.success) {
      return NextResponse.json(
        { error: access.message || "Unauthorized" },
        { status: 403 }
      );
    }

    // 2. Delete Order
    await prisma.order.delete({
      where: {
        id: orderId,
        businessId: businessId,
      },
    });

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("[API] Delete Order Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
