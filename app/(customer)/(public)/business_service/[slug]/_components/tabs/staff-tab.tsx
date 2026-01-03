// app/business_service/[slug]/_components/tabs/staff-tab.tsx

"use client";

import { useMemo, useState } from "react";
import { BusinessDetail } from "@/types/customer/business/business-detail";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Star,
  Phone,
  Mail,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import Image from "next/image";
import { formatPhoneNumber } from "@/lib/utils/business-detail-utils";
import { cn } from "@/lib/utils";
import { BusinessStaff, StaffWorkingHours, DayOfWeek } from "@prisma/client";

type StaffWithHours = BusinessStaff & {
  workingHours?: StaffWorkingHours[];
};

interface StaffTabProps {
  business: BusinessDetail;
}

export function StaffTab({ business }: StaffTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAvailable, setFilterAvailable] = useState<"all" | "available">("all");

  // Filter and search staff
  const filteredStaff = useMemo(() => {
    let staff = business.staff;

    // Filter by availability
    if (filterAvailable === "available") {
      staff = staff.filter((s) => s.isAvailableForBooking && s.isActive);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      staff = staff.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.designation?.toLowerCase().includes(query) ||
          s.specialization?.toLowerCase().includes(query)
      );
    }

    return staff;
  }, [business.staff, searchQuery, filterAvailable]);

  if (business.staff.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Staff Information</h3>
        <p className="text-muted-foreground">
          Staff member profiles are not available yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Our Team
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Meet our {filteredStaff.length} professional team {filteredStaff.length === 1 ? "member" : "members"}
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={filterAvailable === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterAvailable("all")}
            >
              All Staff
            </Button>
            <Button
              variant={filterAvailable === "available" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterAvailable("available")}
            >
              Available Now
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, designation, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Staff Grid */}
      {filteredStaff.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Staff Members Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staff) => (
            <StaffCard key={staff.id} staff={staff} />
          ))}
        </div>
      )}
    </div>
  );
}

// Staff Card Component
function StaffCard({ staff }: { staff: StaffWithHours }) {
  const [showContact, setShowContact] = useState(false);
  const [showHours, setShowHours] = useState(false);

  const DAYS_OF_WEEK: DayOfWeek[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDayShort = (day: DayOfWeek) => {
    return day.slice(0, 3);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Profile Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
        {staff.photo ? (
          <Image
            src={staff.photo}
            alt={staff.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="h-24 w-24 text-muted-foreground" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {staff.isAvailableForBooking && staff.isActive ? (
            <Badge className="bg-secondary text-secondary-foreground gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Available
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              Busy
            </Badge>
          )}
        </div>
      </div>

      {/* Staff Info */}
      <div className="p-5 space-y-4">
        {/* Name & Designation */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-1">{staff.name}</h3>
          {staff.designation && (
            <p className="text-sm text-muted-foreground font-medium">
              {staff.designation}
            </p>
          )}
          {staff.specialization && (
            <p className="text-xs text-primary mt-1">{staff.specialization}</p>
          )}
        </div>

        {/* Bio */}
        {staff.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {staff.bio}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
          {/* Rating */}
          {staff.averageRating && staff.averageRating > 0 ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold text-lg">
                  {staff.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-lg text-muted-foreground">
                  N/A
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          )}

          {/* Bookings */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-semibold text-lg">{staff.totalBookings}</span>
            </div>
            <p className="text-xs text-muted-foreground">Bookings</p>
          </div>
        </div>

        {/* Experience & Qualifications */}
        {(staff.yearsOfExperience || staff.qualifications) && (
          <div className="space-y-2">
            {staff.yearsOfExperience && (
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>
                  {staff.yearsOfExperience} {staff.yearsOfExperience === 1 ? "year" : "years"} experience
                </span>
              </div>
            )}

            {staff.qualifications && (
              <div className="flex items-start gap-2 text-sm">
                <Award className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{staff.qualifications}</span>
              </div>
            )}
          </div>
        )}

        {/* Working Hours */}
        {staff.workingHours && staff.workingHours.length > 0 && (
          <div className="pt-3 border-t border-border">
            {!showHours ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => setShowHours(true)}
              >
                <Clock className="h-4 w-4" />
                View Working Hours
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Working Hours
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHours(false)}
                  >
                    Hide
                  </Button>
                </div>

                {/* Weekly Overview */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const hours = staff.workingHours?.find((h) => h.dayOfWeek === day);
                    const isAvailable = hours?.isAvailable ?? false;
                    return (
                      <Badge
                        key={day}
                        variant={isAvailable ? "default" : "outline"}
                        className="text-xs"
                      >
                        {getDayShort(day)}
                      </Badge>
                    );
                  })}
                </div>

                {/* Detailed Hours */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {DAYS_OF_WEEK.map((day) => {
                    const hours = staff.workingHours?.find((h) => h.dayOfWeek === day);
                    if (!hours || !hours.isAvailable) return null;

                    return (
                      <div
                        key={day}
                        className="flex justify-between items-start text-sm p-2 rounded-md bg-muted/50"
                      >
                        <span className="font-medium capitalize min-w-[80px]">
                          {day.slice(0, 3)}
                        </span>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatTime(hours.startTime)} - {formatTime(hours.endTime)}
                          </div>
                          {hours.breakStartTime && hours.breakEndTime && (
                            <div className="text-xs text-muted-foreground">
                              Break: {formatTime(hours.breakStartTime)} - {formatTime(hours.breakEndTime)}
                            </div>
                          )}
                          {hours.note && (
                            <div className="text-xs text-muted-foreground italic">
                              {hours.note}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact Information */}
        {(staff.phone || staff.email) && (
          <div className="pt-3 border-t border-border">
            {!showContact ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowContact(true)}
              >
                Show Contact Info
              </Button>
            ) : (
              <div className="space-y-2">
                {staff.phone && (
                  <a
                    href={`tel:${staff.phone}`}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors p-2 rounded-md hover:bg-accent"
                  >
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{formatPhoneNumber(staff.phone)}</span>
                  </a>
                )}

                {staff.email && (
                  <a
                    href={`mailto:${staff.email}`}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors p-2 rounded-md hover:bg-accent break-all"
                  >
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{staff.email}</span>
                  </a>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setShowContact(false)}
                >
                  Hide Contact Info
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Availability Status Message */}
        {!staff.isActive && (
          <Badge variant="outline" className="w-full justify-center border-orange-300 text-orange-700">
            Currently Inactive
          </Badge>
        )}
      </div>
    </Card>
  );
}
