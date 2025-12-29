/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/types.ts
import {
  Business,
  User,
  Review,
  Booking,
  Order,
  BusinessStaff,
  Complaint,
} from "@prisma/client";

/**
 * Business with relations for dashboard
 */
export type BusinessWithRelations = Business & {
  owner: User | null;
  _count: {
    reviews: number;
    bookings: number;
    orders: number;
    photos: number;
    complaints: number;
  };
};

/**
 * Review with user data
 */
export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "firstName" | "lastName" | "avatar">;
};

/**
 * Booking with relations
 */
export type BookingWithRelations = Booking & {
  user: Pick<User, "id" | "firstName" | "lastName" | "phone" | "email">;
  staff: BusinessStaff | null;
};

/**
 * Staff with booking count
 */
export type StaffWithBookings = BusinessStaff & {
  _count: {
    bookings: number;
  };
};

/**
 * API Response wrapper
 */
/* trunk-ignore(eslint/@typescript-eslint/no-explicit-any) */
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Dashboard stats type
 */
export type DashboardStats = {
  totalReviews: number;
  averageRating: number;
  totalBookings: number;
  pendingBookings: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalPhotos: number;
  totalComplaints: number;
  unresolvedComplaints: number;
};
