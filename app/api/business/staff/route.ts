// app/api/business/staff/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { z } from "zod";

const DayOfWeek = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const WorkingHoursSchema = z.object({
  dayOfWeek: DayOfWeek,
  startTime: z.string(),
  endTime: z.string(),
  slotDuration: z.number().optional().default(30),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
  isAvailable: z.boolean().optional().default(true),
  note: z.string().optional(),
});

const CreateStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().optional(),
  specialization: z.string().optional(),
  photo: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  yearsOfExperience: z.number().optional(),
  qualifications: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  isAvailableForBooking: z.boolean().optional().default(true),
  displayOrder: z.number().optional().default(0),
  workingHours: z.array(WorkingHoursSchema).optional().default([]),
});

// GET - Fetch all staff for the business
export async function GET(request: NextRequest) {
  try {
    const businessResult = await getCurrentBusiness();

    if (!businessResult.success || !businessResult.business) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const staff = await prisma.businessStaff.findMany({
      where: {
        businessId: businessResult.business.id,
        deletedAt: null,
      },
      include: {
        workingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    return NextResponse.json({ staff }, { status: 200 });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// POST - Create new staff member
export async function POST(request: NextRequest) {
  try {
    const businessResult = await getCurrentBusiness();

    if (!businessResult.success || !businessResult.business) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateStaffSchema.parse(body);

    const { workingHours, ...staffData } = validatedData;

    // Create staff member with working hours in a transaction
    const staff = await prisma.businessStaff.create({
      data: {
        ...staffData,
        businessId: businessResult.business.id,
        workingHours: {
          create: workingHours.map((hours) => ({
            ...hours,
          })),
        },
      },
      include: {
        workingHours: true,
      },
    });

    return NextResponse.json(
      {
        message: "Staff member created successfully",
        staff,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating staff:", error);
    return NextResponse.json(
      { error: "Failed to create staff member" },
      { status: 500 }
    );
  }
}
