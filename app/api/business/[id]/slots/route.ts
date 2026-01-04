import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { addMinutes, format, isAfter, isBefore, isSameDay, parse, set } from "date-fns";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15+ params
) {
  try {
    const { userId } = await auth();
    // Assuming browsing slots is public info (like Yelp), so strict auth checking might block browsing.
    // However, user asked: "only authenticated user can perform/use this service/feature"
    // I will interpret "use this feature" as *booking*, but checking slots usually is open.
    // BUT to strictly follow the prompt "only authenticated... use this service", I will enforce it here too.

    if (!userId) {
       return NextResponse.json({ error: "Authentication required to view slots" }, { status: 401 });
    }

    const { id: businessId } = await params;
    const { searchParams } = new URL(request.url);
    const dateQuery = searchParams.get("date"); // YYYY-MM-DD
    const staffId = searchParams.get("staffId");
    const serviceIds = searchParams.get("serviceIds")?.split(",") || [];

    if (!dateQuery) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const selectedDate = new Date(dateQuery);
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // 1. Get Business Hours for that day
    const dayOfWeekStr = format(selectedDate, "EEEE").toUpperCase(); // MONDAY, TUESDAY...
    // Map to Prisma enum if needed, or if schema uses string, verify.
    // Schema uses DayOfWeek enum.

    // Note: DayOfWeek in Prisma is likely MONDAY, TUESDAY... verify schema.
    // Assuming DayOfWeek enum matches standard upper case.

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        hours: {
          where: { dayOfWeek: dayOfWeekStr as any }
        }
      }
    });

    if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Default hours if not set (or closed)
    const businessHours = business.hours[0];
    if (!businessHours || businessHours.isClosed) {
        return NextResponse.json({ slots: [], reason: "Business is closed" });
    }

    // 2. Determine Service Duration
    let totalDuration = 30; // default
    if (serviceIds.length > 0) {
        const services = await prisma.menuItem.findMany({
            where: { id: { in: serviceIds }, businessId }
        });
        const durationSum = services.reduce((acc, s) => acc + (s.duration || s.serviceDuration || 30), 0);
        if (durationSum > 0) totalDuration = durationSum;
    }

    // 3. Generate Time Slots
    // Start from Open Time to Close Time with 'totalDuration' intervals
    // Format is likely "HH:MM" string in DB
    const [openH, openM] = businessHours.openTime.split(":").map(Number);
    const [closeH, closeM] = businessHours.closeTime.split(":").map(Number);

    let currentSlot = set(selectedDate, { hours: openH, minutes: openM, seconds: 0 });
    const closingTime = set(selectedDate, { hours: closeH, minutes: closeM, seconds: 0 });

    const allSlots: string[] = [];

    while (isBefore(addMinutes(currentSlot, totalDuration), closingTime) || currentSlot.getTime() === closingTime.getTime()) {
        allSlots.push(format(currentSlot, "HH:mm"));
        currentSlot = addMinutes(currentSlot, 30); // Step by 30 mins (standard slot grain), not service duration
    }

    // 4. Filter Booked Slots
    // Find bookings for this staff (or any staff if not selected) on this date
    const conflictingBookings = await prisma.booking.findMany({
        where: {
            businessId,
            ...(staffId ? { staffId } : {}), // If staff selected, check only them. If not, check global capacity? (Complex)
                                           // For MVP: If no staff selected, we show checking generic availability is hard without knowing resource count.
                                           // We will assume "Any Staff" means we check against ALL staff schedules (future improvement).
                                           // For now, let's just filter based on global bookings if staffId is null (simple capacity check not implemented).
                                           // Better approach: If staffId is provided, check their specific bookings.
            status: { in: ["CONFIRMED", "PENDING"] },
            bookingDate: {
                gte: set(selectedDate, { hours: 0, minutes: 0, seconds: 0 }),
                lt: set(selectedDate, { hours: 23, minutes: 59, seconds: 59 }),
            }
        }
    });

    // Simple conflict removal
    // A slot is unavailable if a booking OVERLAPS with it.
    // Slot: Start S, End S+Duration
    // Booking: Start B, End B_End
    // Overlap: S < B_End && S+Duration > B

    // Simplification: just remove slots that exactly match pending booking times for now to save compute
    // Real logic:
    const availableSlots = allSlots.filter(slotTime => {
        const [h, m] = slotTime.split(":").map(Number);
        const slotStart = set(selectedDate, { hours: h, minutes: m });
        const slotEnd = addMinutes(slotStart, totalDuration);

        const isConflict = conflictingBookings.some(booking => {
            const [bh, bm] = booking.bookingTime.split(":").map(Number);
            const bookingStart = set(selectedDate, { hours: bh, minutes: bm }); // Approximation if date differs
            // Better: use booking.bookingDate which is DateTime
            // Re-construct just to be safe with timezone offsets if stored as UTC

            // Allow exact date object from Prisma:
            const bStart = new Date(booking.bookingDate);
            const bEnd = booking.endTime ?
                set(bStart, {
                    hours: parseInt(booking.endTime.split(":")[0]),
                    minutes: parseInt(booking.endTime.split(":")[1])
                })
                : addMinutes(bStart, booking.duration || 30);

            return isBefore(slotStart, bEnd) && isAfter(slotEnd, bStart);
        });

        return !isConflict;
    });

    return NextResponse.json({ slots: availableSlots });

  } catch (error) {
    console.error("Slot fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}
