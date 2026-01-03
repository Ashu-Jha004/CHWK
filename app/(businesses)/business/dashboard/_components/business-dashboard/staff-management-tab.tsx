// app/(businesses)/business/dashboard/_components/business-dashboard/staff-management-tab.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Phone,
  Mail,
  Briefcase,
  Award,
  User,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { BusinessStaff, StaffWorkingHours } from "@prisma/client";
import { AddEditStaffDialog } from "./add-edit-staff-dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type StaffWithHours = BusinessStaff & {
  workingHours: StaffWorkingHours[];
};

interface StaffManagementTabProps {
  businessId: string;
}

export function StaffManagementTab({ businessId }: StaffManagementTabProps) {
  const [staff, setStaff] = useState<StaffWithHours[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffWithHours[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffWithHours | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchStaff();
  }, [businessId]);

  useEffect(() => {
    filterStaff();
  }, [staff, searchQuery, viewFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/business/staff");
      if (!response.ok) throw new Error("Failed to fetch staff");
      const data = await response.json();
      setStaff(data.staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = staff;

    // Filter by status
    if (viewFilter === "active") {
      filtered = filtered.filter((s) => s.isActive);
    } else if (viewFilter === "inactive") {
      filtered = filtered.filter((s) => !s.isActive);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.designation?.toLowerCase().includes(query) ||
          s.specialization?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query)
      );
    }

    setFilteredStaff(filtered);
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setDialogOpen(true);
  };

  const handleEditStaff = (staffMember: StaffWithHours) => {
    setEditingStaff(staffMember);
    setDialogOpen(true);
  };

  const handleDeleteClick = (staffId: string) => {
    setDeletingStaffId(staffId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStaffId) return;

    try {
      const response = await fetch(`/api/business/staff/${deletingStaffId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete staff");

      toast.success("Staff member deleted successfully");
      await fetchStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Failed to delete staff member");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingStaffId(null);
    }
  };

  const handleStaffSaved = () => {
    setDialogOpen(false);
    setEditingStaff(null);
    fetchStaff();
  };

  const getWorkingDaysCount = (workingHours: StaffWorkingHours[]) => {
    return workingHours.filter((h) => h.isAvailable).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Staff Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your team members and their working hours
            </p>
          </div>
          <Button onClick={handleAddStaff} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, designation, specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewFilter("all")}
            >
              All ({staff.length})
            </Button>
            <Button
              variant={viewFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewFilter("active")}
            >
              Active ({staff.filter((s) => s.isActive).length})
            </Button>
            <Button
              variant={viewFilter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewFilter("inactive")}
            >
              Inactive ({staff.filter((s) => !s.isActive).length})
            </Button>
          </div>
        </div>
      </Card>

      {/* Staff List */}
      {filteredStaff.length === 0 ? (
        <Card className="p-12 text-center">
          {searchQuery || viewFilter !== "all" ? (
            <>
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Staff Members Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setViewFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Staff Members Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first team member to get started
              </p>
              <Button onClick={handleAddStaff} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Staff Member
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStaff.map((staffMember) => (
            <Card key={staffMember.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header with Photo */}
                <div className="flex gap-4 mb-4">
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    {staffMember.photo ? (
                      <Image
                        src={staffMember.photo}
                        alt={staffMember.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">{staffMember.name}</h3>
                    {staffMember.designation && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Briefcase className="h-3 w-3" />
                        {staffMember.designation}
                      </p>
                    )}
                    {staffMember.specialization && (
                      <p className="text-xs text-primary mt-1">{staffMember.specialization}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Badge variant={staffMember.isActive ? "default" : "secondary"}>
                      {staffMember.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {staffMember.isAvailableForBooking && staffMember.isActive && (
                      <Badge variant="outline" className="text-xs">
                        Bookable
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {staffMember.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {staffMember.bio}
                  </p>
                )}

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                  {staffMember.yearsOfExperience && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{staffMember.yearsOfExperience} yrs exp</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{getWorkingDaysCount(staffMember.workingHours)} days/week</span>
                  </div>
                  {staffMember.phone && (
                    <div className="flex items-center gap-2 text-sm truncate col-span-2">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{staffMember.phone}</span>
                    </div>
                  )}
                  {staffMember.email && (
                    <div className="flex items-center gap-2 text-sm truncate col-span-2">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{staffMember.email}</span>
                    </div>
                  )}
                </div>

                {/* Working Hours Summary */}
                {staffMember.workingHours.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Working Days:</p>
                    <div className="flex flex-wrap gap-1">
                      {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(
                        (day) => {
                          const dayShort = day.slice(0, 3);
                          const hours = staffMember.workingHours.find((h) => h.dayOfWeek === day);
                          return (
                            <Badge
                              key={day}
                              variant={hours?.isAvailable ? "default" : "outline"}
                              className="text-xs"
                            >
                              {dayShort}
                            </Badge>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleEditStaff(staffMember)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(staffMember.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <AddEditStaffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        staff={editingStaff}
        onSuccess={handleStaffSaved}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Staff Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
              All associated data including working hours will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
