// app/(businesses)/business/dashboard/_components/business-dashboard/add-edit-staff-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessStaff, StaffWorkingHours, DayOfWeek } from "@prisma/client";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { z } from "zod";

type StaffWithHours = BusinessStaff & {
  workingHours: StaffWorkingHours[];
};

interface AddEditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffWithHours | null;
  onSuccess: () => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

interface WorkingHoursData {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDuration: number;
  breakStartTime?: string;
  breakEndTime?: string;
  isAvailable: boolean;
  note?: string;
}

export function AddEditStaffDialog({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: AddEditStaffDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Basic Info
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [photo, setPhoto] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">("");
  const [qualifications, setQualifications] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isAvailableForBooking, setIsAvailableForBooking] = useState(true);

  // Working Hours
  const [workingHours, setWorkingHours] = useState<WorkingHoursData[]>([]);

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setDesignation(staff.designation || "");
      setSpecialization(staff.specialization || "");
      setPhoto(staff.photo || "");
      setBio(staff.bio || "");
      setPhone(staff.phone || "");
      setEmail(staff.email || "");
      setYearsOfExperience(staff.yearsOfExperience || "");
      setQualifications(staff.qualifications || "");
      setIsActive(staff.isActive);
      setIsAvailableForBooking(staff.isAvailableForBooking);
      setWorkingHours(
        staff.workingHours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          startTime: h.startTime,
          endTime: h.endTime,
          slotDuration: h.slotDuration,
          breakStartTime: h.breakStartTime || undefined,
          breakEndTime: h.breakEndTime || undefined,
          isAvailable: h.isAvailable,
          note: h.note || undefined,
        }))
      );
    } else {
      resetForm();
    }
  }, [staff]);

  const resetForm = () => {
    setName("");
    setDesignation("");
    setSpecialization("");
    setPhoto("");
    setBio("");
    setPhone("");
    setEmail("");
    setYearsOfExperience("");
    setQualifications("");
    setIsActive(true);
    setIsAvailableForBooking(true);
    setWorkingHours([]);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "business_staff");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setPhoto(data.secure_url);
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const updateWorkingHours = (day: DayOfWeek, updates: Partial<WorkingHoursData>) => {
    setWorkingHours((prev) => {
      const existing = prev.find((h) => h.dayOfWeek === day);
      if (existing) {
        return prev.map((h) =>
          h.dayOfWeek === day ? { ...h, ...updates } : h
        );
      } else {
        return [
          ...prev,
          {
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00",
            slotDuration: 30,
            isAvailable: true,
            ...updates,
          },
        ];
      }
    });
  };

  const toggleDayAvailability = (day: DayOfWeek) => {
    const existing = workingHours.find((h) => h.dayOfWeek === day);
    if (existing) {
      if (existing.isAvailable) {
        // Remove the day
        setWorkingHours(workingHours.filter((h) => h.dayOfWeek !== day));
      } else {
        updateWorkingHours(day, { isAvailable: true });
      }
    } else {
      // Add the day with default hours
      updateWorkingHours(day, { isAvailable: true });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (email && !z.string().email().safeParse(email).success) {
      toast.error("Invalid email address");
      return;
    }

    try {
      setLoading(true);

      const data = {
        name: name.trim(),
        designation: designation.trim() || undefined,
        specialization: specialization.trim() || undefined,
        photo: photo || undefined,
        bio: bio.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        yearsOfExperience: yearsOfExperience || undefined,
        qualifications: qualifications.trim() || undefined,
        isActive,
        isAvailableForBooking,
        workingHours: workingHours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          startTime: h.startTime,
          endTime: h.endTime,
          slotDuration: h.slotDuration,
          breakStartTime: h.breakStartTime || undefined,
          breakEndTime: h.breakEndTime || undefined,
          isAvailable: h.isAvailable,
          note: h.note || undefined,
        })),
      };

      const url = staff
        ? `/api/business/staff/${staff.id}`
        : "/api/business/staff";
      const method = staff ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save staff");
      }

      toast.success(
        staff
          ? "Staff member updated successfully"
          : "Staff member added successfully"
      );
      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error saving staff:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save staff member"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {staff ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {staff
              ? "Update staff member details and working hours"
              : "Add a new team member with their details and working hours"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="hours">Working Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg">
              <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted">
                {photo ? (
                  <>
                    <Image
                      src={photo}
                      alt="Staff photo"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => setPhoto("")}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8" />
                    )}
                  </div>
                )}
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a profile photo (Max 5MB)
                </p>
              </div>
            </div>

            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g., Senior Consultant"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g., Hair Styling, Massage Therapy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={yearsOfExperience}
                  onChange={(e) =>
                    setYearsOfExperience(
                      e.target.value ? parseInt(e.target.value) : ""
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input
                  id="qualifications"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="Degrees, certifications"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief description about the staff member"
                  rows={3}
                />
              </div>
            </div>

            {/* Switches */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Show this staff member to customers
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isAvailableForBooking">
                    Available for Booking
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to book appointments
                  </p>
                </div>
                <Switch
                  id="isAvailableForBooking"
                  checked={isAvailableForBooking}
                  onCheckedChange={setIsAvailableForBooking}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set the working hours for each day of the week. Customers will be
              able to see when this staff member is available.
            </p>

            {DAYS_OF_WEEK.map((day) => {
              const hours = workingHours.find((h) => h.dayOfWeek === day);
              const isAvailable = hours?.isAvailable ?? false;

              return (
                <div
                  key={day}
                  className="p-4 border rounded-lg space-y-3 bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <Label className="font-medium capitalize">
                      {day.toLowerCase()}
                    </Label>
                    <Switch
                      checked={isAvailable}
                      onCheckedChange={() => toggleDayAvailability(day)}
                    />
                  </div>

                  {isAvailable && hours && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Start Time</Label>
                        <Input
                          type="time"
                          value={hours.startTime}
                          onChange={(e) =>
                            updateWorkingHours(day, {
                              startTime: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">End Time</Label>
                        <Input
                          type="time"
                          value={hours.endTime}
                          onChange={(e) =>
                            updateWorkingHours(day, {
                              endTime: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Break Start</Label>
                        <Input
                          type="time"
                          value={hours.breakStartTime || ""}
                          onChange={(e) =>
                            updateWorkingHours(day, {
                              breakStartTime: e.target.value || undefined,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Break End</Label>
                        <Input
                          type="time"
                          value={hours.breakEndTime || ""}
                          onChange={(e) =>
                            updateWorkingHours(day, {
                              breakEndTime: e.target.value || undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {staff ? "Update" : "Add"} Staff Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
