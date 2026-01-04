"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SlotPicker } from "./slot-picker";
import { ServiceSelector } from "./service-selector";
import { Loader2, Calendar, CheckCircle2 } from "lucide-react";

interface BookingWizardProps {
  business: any;
  services: any[];
  staff: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any; // Clerk user object
}

type Step = "SERVICE" | "SLOT" | "DETAILS" | "CONFIRMATION";

export function BookingWizard({ business, services, staff, open, onOpenChange, user }: BookingWizardProps) {
  const [step, setStep] = useState<Step>("SERVICE");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState(user?.primaryPhoneNumber?.phoneNumber || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Filter services
  const bookableServices = services.filter(s => s.itemType === "SERVICE" && s.isAvailable);

  const handleNext = () => {
    if (step === "SERVICE") {
      if (selectedServices.length === 0) {
        toast.error("Please select at least one service");
        return;
      }
      setStep("SLOT");
    } else if (step === "SLOT") {
      if (!selectedDate || !selectedTime) {
        toast.error("Please select a date and time");
        return;
      }
      setStep("DETAILS");
    }
  };

  const handleBack = () => {
    if (step === "SLOT") setStep("SERVICE");
    else if (step === "DETAILS") setStep("SLOT");
  };

  const handleSubmit = async () => {
    if (!customerPhone) {
      toast.error("Phone number is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        businessId: business.id,
        serviceIds: selectedServices,
        date: format(selectedDate!, "yyyy-MM-dd"), // Ensure Date is not null via logic checks above
        time: selectedTime,
        customerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Guest",
        customerPhone,
        customerEmail: user.primaryEmailAddress?.emailAddress,
        specialRequests: notes,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      setBookingResult(data.booking);
      setStep("CONFIRMATION");
      toast.success("Booking confirmed!");
    } catch (error) {
       toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectedServicesObjects = services.filter(s => selectedServices.includes(s.id));
  const totalAmount = selectedServicesObjects.reduce((acc, s) => acc + (s.discountedPrice || s.price), 0);
  const totalDuration = selectedServicesObjects.reduce((acc, s) => acc + (s.duration || 30), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {step === "CONFIRMATION" ? "Booking Confirmed" : "Book Appointment"}
          </DialogTitle>
          <DialogDescription>
             {business.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {step === "SERVICE" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Services</h3>
              <ServiceSelector
                services={bookableServices}
                selectedIds={selectedServices}
                onToggle={handleToggleService}
              />
            </div>
          )}

          {step === "SLOT" && (
            <div className="space-y-4 h-full">
               <SlotPicker
                 businessId={business.id}
                 serviceIds={selectedServices}
                 onSelect={(d, t) => {
                    setSelectedDate(d);
                    setSelectedTime(t);
                 }}
               />
            </div>
          )}

          {step === "DETAILS" && (
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                 <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(selectedDate!, "EEEE, MMMM do yyyy")} at {selectedTime}
                 </h4>
                 <div className="text-sm space-y-1">
                    {selectedServicesObjects.map(s => (
                        <div key={s.id} className="flex justify-between">
                            <span>{s.name}</span>
                            <span>₹{s.discountedPrice || s.price}</span>
                        </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold mt-2">
                        <span>Total ({totalDuration} mins)</span>
                        <span>₹{totalAmount}</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                  <div className="space-y-2">
                      <Label>Your Phone Number</Label>
                      <Input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91..."
                      />
                  </div>
                  <div className="space-y-2">
                      <Label>Special Instructions (Optional)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any allergies, preferences, etc."
                      />
                  </div>
              </div>
            </div>
          )}

          {step === "CONFIRMATION" && bookingResult && (
             <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">You're Booked!</h3>
                    <p className="text-muted-foreground mt-2">
                        Booking #{bookingResult.bookingNumber} confirmed.
                    </p>
                </div>
                <div className="text-sm bg-muted p-4 rounded-lg w-full max-w-sm">
                    <p>We've sent a confirmation to your email.</p>
                </div>
             </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-background">
            {step === "CONFIRMATION" ? (
                <Button onClick={() => onOpenChange(false)} className="w-full">
                    Done
                </Button>
            ) : (
                <div className="flex justify-between w-full">
                    {step !== "SERVICE" ? (
                        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                            Back
                        </Button>
                    ) : (
                        <span /> // Spacer
                    )}

                    {step === "DETAILS" ? (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Booking
                        </Button>
                    ) : (
                        <Button onClick={handleNext} disabled={step === "SLOT" && !selectedTime}>
                            Next
                        </Button>
                    )}
                </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
