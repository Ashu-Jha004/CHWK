// app/business_service/[slug]/_components/modals/report-modal.tsx

"use client";

import { useState } from "react";
import { BusinessDetail } from "@/types/customer/business/business-detail";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Flag,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useBusinessDetailStore } from "@/store/customer/business_service/business-detail-store";
import { cn } from "@/lib/utils";

interface ReportModalProps {
  business: BusinessDetail;
}

type ReportReason =
  | "INCORRECT_INFO"
  | "CLOSED_PERMANENTLY"
  | "DUPLICATE"
  | "INAPPROPRIATE"
  | "SPAM"
  | "OTHER";

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: "INCORRECT_INFO",
    label: "Incorrect Information",
    description: "Wrong address, phone, hours, or other details",
  },
  {
    value: "CLOSED_PERMANENTLY",
    label: "Permanently Closed",
    description: "This business is no longer operating",
  },
  {
    value: "DUPLICATE",
    label: "Duplicate Listing",
    description: "This business is listed multiple times",
  },
  {
    value: "INAPPROPRIATE",
    label: "Inappropriate Content",
    description: "Contains offensive or inappropriate material",
  },
  {
    value: "SPAM",
    label: "Spam or Fake",
    description: "Fake business or spam listing",
  },
  {
    value: "OTHER",
    label: "Other Issue",
    description: "Something else is wrong with this listing",
  },
];

export function ReportModal({ business }: ReportModalProps) {
  const { reportModalOpen, setReportModalOpen } = useBusinessDetailStore();
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, call your API:
      // const response = await fetch("/api/reports", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     businessId: business.id,
      //     reason,
      //     details,
      //     anonymous,
      //   }),
      // });

      setSubmitted(true);

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportModalOpen(false);
    // Reset form after animation
    setTimeout(() => {
      setReason("");
      setDetails("");
      setAnonymous(false);
      setSubmitted(false);
    }, 300);
  };

  return (
    <Dialog open={reportModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-destructive" />
                Report an Issue
              </DialogTitle>
              <DialogDescription>
                Help us improve by reporting problems with this business listing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Business Info */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="font-semibold">{business.name}</p>
                <p className="text-sm text-muted-foreground">
                  {business.area}, {business.city}
                </p>
              </div>

              {/* Report Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">
                  What's the issue? <span className="text-destructive">*</span>
                </Label>
                <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        <div className="space-y-1">
                          <p className="font-medium">{r.label}</p>
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Details */}
              <div className="space-y-2">
                <Label htmlFor="details">
                  Additional Details {reason !== "OTHER" && "(Optional)"}
                </Label>
                <Textarea
                  id="details"
                  placeholder="Please provide more information about the issue..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {details.length}/500 characters
                </p>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border">
                <Checkbox
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={(checked) => setAnonymous(checked as boolean)}
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="anonymous"
                    className="cursor-pointer font-normal"
                  >
                    Submit anonymously
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Your identity will not be shared with the business owner
                  </p>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  False reports may result in account suspension. Please ensure your report is accurate.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reason || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Success State
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Report Submitted</h3>
              <p className="text-muted-foreground">
                Thank you for helping us maintain accurate information. We'll review your report shortly.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
