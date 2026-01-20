import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { startOfDay, endOfDay, parse, format, addMinutes, isBefore, isAfter, isSameDay } from "date-fns";

// Validation schema for creating a booking
const createBookingSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  staffId: z.string().optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  serviceIds: z.array(z.string()).min(1, "At least one service is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  specialRequests: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid booking data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const {
      businessId,
      staffId,
      date,
      time,
      serviceIds,
      customerPhone,
      customerName,
      customerEmail,
      specialRequests,
    } = validation.data;

    const bookingDate = new Date(date);

    // 1. Verify Business exists and accepts bookings
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { acceptsBookings: true, autoConfirmBookings: true }, // Optimization: Only select needed fields
    });

    if (!business || !business.acceptsBookings) {
      return NextResponse.json(
        { error: "Business not found or does not accept bookings" },
        { status: 404 }
      );
    }

    // 2. Fetch services to calculate duration and total price
    const services = await prisma.menuItem.findMany({
      where: {
        id: { in: serviceIds },
        businessId: businessId,
        isAvailable: true,
      },
    });

    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        { error: "One or more selected services are invalid or unavailable" },
        { status: 400 }
      );
    }

    const totalDuration = services.reduce((acc, s) => acc + (s.duration || s.serviceDuration || 30), 0);
    const totalAmount = services.reduce((acc, s) => acc + (s.discountedPrice || s.price), 0);

    const [hours, minutes] = time.split(":").map(Number);
    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = addMinutes(startDateTime, totalDuration);
    const endTime = format(endDateTime, "HH:mm");

    // 4. Validate Availability (Basic Check)
    if (staffId) {
        // Fix: Check for all bookings on the SAME DAY, not just exact same start time
        const dayStart = startOfDay(startDateTime);
        const dayEnd = endOfDay(startDateTime);

        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                businessId,
                staffId,
                bookingDate: {
                    gte: dayStart,
                    lte: dayEnd
                },
                status: {
                    in: ["CONFIRMED", "PENDING"]
                },
                OR: [
                    // New start is within existing range
                    {
                         bookingTime: { lte: time },
                         endTime: { gt: time }
                    },
                    // New end is within existing range
                    {
                        bookingTime: { lt: endTime },
                        endTime: { gte: endTime }
                    },
                    // New range completely encompasses existing
                    {
                        bookingTime: { gte: time },
                        endTime: { lte: endTime }
                    }
                ]
            }
        });

        if (conflictingBooking) {
            return NextResponse.json(
                { error: "Selected time slot is not available for this staff member" },
                { status: 409 }
            );
        }
    }

    // 5. Create Booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId,
        userId,
        staffId,
        bookingDate: startDateTime, // Store full DateTime
        bookingTime: time,
        endTime,
        duration: totalDuration,
        status: business.autoConfirmBookings ? "CONFIRMED" : "PENDING",
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        serviceIds,
        totalAmount,
        specialRequests,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, booking });

  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
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

        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                business: {
                    select: {
                        name: true,
                        slug: true,
                        addressLine1: true,
                        city: true
                    }
                }
            },
            orderBy: {
                bookingDate: 'desc'
            }
        });

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error("Fetch bookings error:", error);
        return NextResponse.json(
          { error: "Failed to fetch bookings" },
          { status: 500 }
        );
    }
}
