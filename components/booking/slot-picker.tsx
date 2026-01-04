"use client";

import { useState } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming sonner or use-toast is available

interface SlotPickerProps {
  businessId: string;
  staffId?: string;
  serviceIds: string[];
  onSelect: (date: Date, time: string) => void;
}

export function SlotPicker({ businessId, staffId, serviceIds, onSelect }: SlotPickerProps) {
  const [date, setDate] = useState<Date | undefined>(startOfToday());
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Fetch slots when date changes
  const fetchSlots = async (selectedDate: Date) => {
    setLoading(true);
    setSlots([]);
    setSelectedTime(null);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const params = new URLSearchParams({
        date: dateStr,
        serviceIds: serviceIds.join(","),
      });
      if (staffId) params.append("staffId", staffId);

      const res = await fetch(`/api/business/${businessId}/slots?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load slots");

      const data = await res.json();
      setSlots(data.slots || []);
    } catch (error) {
      toast.error("Could not load available times");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when date is selected from Calendar
  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    if (d) fetchSlots(d);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (date) onSelect(date, time);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      <div className="border-r pr-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(date: Date) => date < startOfToday()}
          className="rounded-md border shadow-sm"
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <h3 className="font-medium mb-3">
          Available Times for {date ? format(date, "MMM do") : "..."}
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !date ? (
          <p className="text-muted-foreground text-sm">Please select a date first.</p>
        ) : slots.length === 0 ? (
          <p className="text-muted-foreground text-sm">No slots available on this date.</p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-3 gap-2 pr-4">
              {slots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={cn(
                    "text-xs",
                    selectedTime === time && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
