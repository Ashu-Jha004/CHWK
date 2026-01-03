// app/api/business/staff/[id]/route.ts
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
  id: z.string().optional(),
  dayOfWeek: DayOfWeek,
  startTime: z.string(),
  endTime: z.string(),
  slotDuration: z.number().optional().default(30),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
  isAvailable: z.boolean().optional().default(true),
  note: z.string().optional(),
});

const UpdateStaffSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  designation: z.string().optional(),
  specialization: z.string().optional(),
  photo: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  yearsOfExperience: z.number().optional(),
  qualifications: z.string().optional(),
  isActive: z.boolean().optional(),
  isAvailableForBooking: z.boolean().optional(),
  displayOrder: z.number().optional(),
  workingHours: z.array(WorkingHoursSchema).optional(),
});

// GET - Fetch single staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessResult = await getCurrentBusiness();

    if (!businessResult.success || !businessResult.business) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const staff = await prisma.businessStaff.findFirst({
      where: {
        id,
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
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ staff }, { status: 200 });
  } catch (error) {
    console.error("Error fetching staff member:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff member" },
      { status: 500 }
    );
  }
}

// PUT - Update staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessResult = await getCurrentBusiness();

    if (!businessResult.success || !businessResult.business) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify staff belongs to business
    const existingStaff = await prisma.businessStaff.findFirst({
      where: {
        id,
        businessId: businessResult.business.id,
        deletedAt: null,
      },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateStaffSchema.parse(body);

    const { workingHours, ...staffData } = validatedData;

    // Update staff in a transaction
    const staff = await prisma.$transaction(async (tx) => {
      // Update staff basic info
      const updatedStaff = await tx.businessStaff.update({
        where: { id },
        data: staffData,
      });

      // Update working hours if provided
      if (workingHours) {
        // Delete existing hours
        await tx.staffWorkingHours.deleteMany({
          where: { staffId: id },
        });

        // Create new hours
        await tx.staffWorkingHours.createMany({
          data: workingHours.map((hours) => ({
            staffId: id,
            dayOfWeek: hours.dayOfWeek,
            startTime: hours.startTime,
            endTime: hours.endTime,
            slotDuration: hours.slotDuration || 30,
            breakStartTime: hours.breakStartTime,
            breakEndTime: hours.breakEndTime,
            isAvailable: hours.isAvailable ?? true,
            note: hours.note,
          })),
        });
      }

      // Return updated staff with working hours
      return await tx.businessStaff.findUnique({
        where: { id },
        include: {
          workingHours: {
            orderBy: {
              dayOfWeek: "asc",
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        message: "Staff member updated successfully",
        staff,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Failed to update staff member" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessResult = await getCurrentBusiness();

    if (!businessResult.success || !businessResult.business) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify staff belongs to business
    const existingStaff = await prisma.businessStaff.findFirst({
      where: {
        id,
        businessId: businessResult.business.id,
        deletedAt: null,
      },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.businessStaff.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return NextResponse.json(
      { message: "Staff member deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      { error: "Failed to delete staff member" },
      { status: 500 }
    );
  }
}
