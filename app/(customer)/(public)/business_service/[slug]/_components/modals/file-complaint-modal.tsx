"use client";

import { useTransition, useState } from "react";
import { useBusinessDetailStore, useComplaintModal } from "@/store/customer/business_service/business-detail-store";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BusinessDetail } from "@/types/customer/business/business-detail";

interface FileComplaintModalProps {
  business: BusinessDetail;
}

export function FileComplaintModal({ business }: FileComplaintModalProps) {
  const { isOpen, setOpen } = useComplaintModal();
  const [isPending, startTransition] = useTransition();

  // Local Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !category || !description || !contactName || !contactPhone) {
        toast.error("Please fill all fields");
        return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/complaints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                businessId: business.id,
                subject,
                category,
                description,
                contactName,
                contactPhone
            })
        });

        if (!res.ok) throw new Error("Failed to submit");

        toast.success("Complaint submitted successfully. We will notify you of updates.");
        setOpen(false);
        // Reset form
        setSubject("");
        setCategory("");
        setDescription("");
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>File a Complaint</DialogTitle>
          <DialogDescription>
            Submit an issue regarding {business.name}. The business owner will be notified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
                id="subject"
                placeholder="Brief summary of the issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Service Quality">Service Quality</SelectItem>
                    <SelectItem value="Billing Issue">Billing Issue</SelectItem>
                    <SelectItem value="Staff Behavior">Staff Behavior</SelectItem>
                    <SelectItem value="Delay">Delay / No Show</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
             <Label htmlFor="description">Description</Label>
             <Textarea
                id="description"
                placeholder="Describe what happened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
             />
          </div>
           <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                        id="contactName"
                        placeholder="Your Name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                    />
               </div>
               <div className="grid gap-2">
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                        id="contactPhone"
                        placeholder="Mobile Number"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                    />
               </div>
           </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Complaint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
