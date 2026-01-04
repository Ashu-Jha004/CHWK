import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

/**
 * Daily Cleanup Task
 * Deletes Notifications and Orders older than 7 days.
 * Route: /api/cron/cleanup
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Optional: Add a simple secret check to prevent unauthorized calls
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If a secret is defined in env, enforce it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sevenDaysAgo = subDays(new Date(), 7);

    // 2. Delete Old Notifications
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    // 3. Delete Old Orders
    // We typically only delete orders that are in a final state (DELIVERED, CANCELLED)
    // or we can delete all old orders if the user specifically asked for "order data gets deleted"
    const deletedOrders = await prisma.order.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
        // Optional: Keep active orders even if they are old (though usually orders finish within 7 days)
        status: {
          in: ["DELIVERED", "CANCELLED", "REFUNDED", "PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP"],
        },
      },
    });

    console.log(`[Cron Cleanup] Deleted ${deletedNotifications.count} notifications and ${deletedOrders.count} orders older than 7 days.`);

    return NextResponse.json({
      success: true,
      summary: {
        notificationsDeleted: deletedNotifications.count,
        ordersDeleted: deletedOrders.count,
      },
    });
  } catch (error) {
    console.error("[Cron Cleanup Error]:", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
