"use client";

import { useState, useEffect } from "react";
import { format, startOfToday, startOfMonth, endOfMonth, isSameDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Calendar as CalendarIcon, List as ListIcon, Clock, User, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookingsClientProps {
  businessId: string;
}

export function BookingsClient({ businessId }: BookingsClientProps) {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [date, setDate] = useState<Date | undefined>(startOfToday());
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (date) params.append("date", format(date, "yyyy-MM-dd"));

      // If list view, maybe fetch all upcoming? For now, stick to selected date filtering or month
      // logic for calendar view needs month bookings to show dots.
      // Let's keep it simple: Fetch bookings for selected DATE.

      const res = await fetch(`/api/business/${businessId}/bookings?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBookings(data.bookings || []);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
        const res = await fetch(`/api/business/${businessId}/bookings/${bookingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error("Failed to update status");

        toast.success(`Booking ${newStatus.toLowerCase()}`);
        fetchBookings(); // Refresh list
    } catch (error) {
        toast.error("Status update failed");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar / Filters */}
      <div className="w-full md:w-[320px] space-y-4">
        <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-lg">Select Date</CardTitle>
           </CardHeader>
           <CardContent>
             <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border mx-auto"
             />
           </CardContent>
        </Card>

        {/* Info / Stats Cards */}
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground text-sm">Total Bookings</span>
                    <span className="font-bold">{bookings.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground text-sm">Confirmed</span>
                    <span className="font-bold text-green-600">
                        {bookings.filter((b: any) => b.status === "CONFIRMED").length}
                    </span>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
                {date ? format(date, "EEEE, MMMM do, yyyy") : "All Upcoming"}
            </h2>
            <div className="flex gap-2">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={fetchBookings}
                 disabled={loading}
               >
                 <CalendarIcon className="h-4 w-4 mr-2" />
                 Refresh View
               </Button>
            </div>
        </div>

        {loading ? (
           <div className="flex justify-center py-12">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : bookings.length === 0 ? (
           <div className="text-center py-12 border rounded-lg bg-muted/20">
             <p className="text-muted-foreground">No bookings found for this date.</p>
           </div>
        ) : (
           <div className="grid gap-4">
              {bookings.map((booking: any) => (
                 <BookingCard
                    key={booking.id}
                    booking={booking}
                    onStatusUpdate={(status) => updateBookingStatus(booking.id, status)}
                />
              ))}
           </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, onStatusUpdate }: { booking: any; onStatusUpdate: (status: string) => void }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        CONFIRMED: "bg-green-100 text-green-800",
        CANCELLED: "bg-red-100 text-red-800",
        CANCELLED_BY_USER: "bg-red-100 text-red-800",
        CANCELLED_BY_BUSINESS: "bg-red-100 text-red-800",
        COMPLETED: "bg-blue-100 text-blue-800",
    };

    return (
        <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-0">
                <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all hover:bg-muted/5">
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center justify-center bg-muted h-16 w-16 rounded-lg border flex-shrink-0">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase leading-none mb-1">
                            {format(new Date(booking.bookingDate), "a")}
                            </span>
                            <span className="text-xl font-bold leading-none">
                            {booking.bookingTime}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-semibold flex items-center gap-2">
                                {booking.customerName}
                                <Badge variant="secondary" className={cn("text-[10px] font-semibold uppercase px-2", statusColors[booking.status])}>
                                    {booking.status}
                                </Badge>
                            </h3>
                            <div className="text-sm text-muted-foreground flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" /> {booking.customerPhone}
                                </div>
                                {booking.serviceIds && (
                                    <div className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded w-fit border border-primary/10">
                                        {booking.serviceIds.length} Service(s) Booked
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full md:w-auto text-xs"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? "Hide Details" : "View Details"}
                        </Button>
                        {booking.status === "PENDING" && (
                            <Button
                                size="sm"
                                className="w-full md:w-auto text-xs font-bold"
                                onClick={() => onStatusUpdate("CONFIRMED")}
                            >
                                Confirm
                            </Button>
                        )}
                        {booking.status === "CONFIRMED" && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full md:w-auto text-xs"
                                onClick={() => onStatusUpdate("COMPLETED")}
                            >
                                Complete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t bg-muted/10 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contact Info</h4>
                                <div className="space-y-1">
                                    <p className="text-sm flex items-center gap-2"><Phone className="h-3 w-3" /> {booking.customerPhone}</p>
                                    {booking.customerEmail && <p className="text-sm flex items-center gap-2"><Mail className="h-3 w-3" /> {booking.customerEmail}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Booking Info</h4>
                                <div className="space-y-1">
                                    <p className="text-sm">Number: <span className="font-mono text-xs">{booking.bookingNumber}</span></p>
                                    {booking.totalAmount > 0 && <p className="text-sm font-semibold">Total: ₹{booking.totalAmount}</p>}
                                </div>
                            </div>
                        </div>

                        {booking.specialRequests && (
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Special Requests</h4>
                                <p className="text-sm italic bg-card p-2 rounded border border-dashed text-muted-foreground">"{booking.specialRequests}"</p>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                            {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-7"
                                    onClick={() => onStatusUpdate("CANCELLED_BY_BUSINESS")}
                                >
                                    Cancel Booking
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
