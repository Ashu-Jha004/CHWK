import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createOrderSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  orderText: z.string().min(1, "Order description is required"),
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const {
      businessId,
      orderText,
      customerName,
      customerPhone,
      customerEmail,
    } = validation.data;

    // Verify Business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Create Order with Custom Request
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId,
        userId,
        orderType: "PICKUP", // Default
        status: "PENDING",
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        specialInstructions: orderText, // Store custom request here
        subtotal: 0,
        total: 0,
        items: {
           // No items for this custom text request
        }
      },
    });

    return NextResponse.json({ success: true, order });

  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        business: {
          select: {
            name: true,
            logo: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[Orders GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
